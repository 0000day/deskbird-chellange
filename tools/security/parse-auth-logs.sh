# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load configuration
source "$SCRIPT_DIR/config.env"

# Debug function
debug() {
    if [[ "$DEBUG" == "true" ]]; then
        echo "[DEBUG] $1" >&2
    fi
}

# Function to get geolocation for IP
get_geolocation() {
    local ip="$1"
    local result
    
    if [[ -n "$IPINFO_API_KEY" ]]; then
        result=$(curl -s -f "${IPINFO_API_URL}/${ip}?token=${IPINFO_API_KEY}" || echo '{}')
    else
        result=$(curl -s -f "${IPINFO_API_URL}/${ip}" || echo '{}')
    fi
    
    echo "$result"
}

# Function to insert or update IP address
upsert_ip_address() {
    local ip="$1"
    local country="$2"
    local city="$3"
    
    local query="
    WITH upsert AS (
        INSERT INTO ip_addresses (ip_address, country, city, attack_count, created_at, updated_at)
        VALUES ('$ip', '$country', '$city', 1, NOW(), NOW())
        ON CONFLICT (ip_address)
        DO UPDATE SET 
            attack_count = ip_addresses.attack_count + 1,
            updated_at = NOW()
        RETURNING id
    )
    SELECT id FROM upsert;
    "
    
    psql "$DATABASE_URL" -t -A -c "$query" | head -1 | xargs
}

# Function to insert attack attempt (with duplicate prevention)
insert_attack_attempt() {
    local ip_id="$1"
    local username="$2" 
    local timestamp="$3"
    
    psql "$DATABASE_URL" -c "
        INSERT INTO attack_attempts (ip_id, username, timestamp)
        VALUES ($ip_id, '$username', '$timestamp')
        ON CONFLICT (ip_id, username, timestamp) DO NOTHING;
    " > /dev/null
}

# Function to parse auth log
parse_auth_log() {
    local log_file="$1"
    local processed_count=0
    
    # Create temporary file with log entries - NEWEST FIRST (tac reverses the order)
    local temp_file=$(mktemp)
    grep "Invalid user" "$log_file" | tac > "$temp_file"
    
    echo "Processing log entries from newest to oldest..."
    
    # Process each line from the temporary file
    while IFS= read -r line; do
        # Extract IP address
        ip=$(echo "$line" | grep -oE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}")
        
        # Extract username
        username=$(echo "$line" | sed -n 's/.*Invalid user \([^ ]*\) from.*/\1/p')
        
        # Extract timestamp
        timestamp=$(echo "$line" | awk '{print $1}')
        
        # Skip if any field is empty
echo "DEBUG: ip="$ip" username="$username" timestamp="$timestamp""
        if [[ -z "$ip" || -z "$username" || -z "$timestamp" ]]; then
            debug "Skipping invalid line: $line"
            continue
        fi
        
        debug "Processing: IP=$ip, User=$username, Time=$timestamp"
        
        # Get geolocation data
        geo_data=$(get_geolocation "$ip")
        country=$(echo "$geo_data" | jq -r '.country // "Unknown"' 2>/dev/null || echo "Unknown")
        city=$(echo "$geo_data" | jq -r '.city // "Unknown"' 2>/dev/null || echo "Unknown")
        
        # Escape single quotes for SQL
        username=$(echo "$username" | sed "s/'/''/g")
        country=$(echo "$country" | sed "s/'/''/g") 
        city=$(echo "$city" | sed "s/'/''/g")
        
        # Insert/update IP address and get ID
        ip_id=$(upsert_ip_address "$ip" "$country" "$city")
        
        # Insert attack attempt
        insert_attack_attempt "$ip_id" "$username" "$timestamp"
        
        ((processed_count++))
        
        # Rate limiting to avoid API abuse
        sleep 0.1
        
        # Limit records per run
        if [[ $processed_count -ge $MAX_RECORDS_PER_RUN ]]; then
            debug "Reached max records limit: $MAX_RECORDS_PER_RUN"
            break
        fi
    done < "$temp_file"
    
    # Cleanup
    rm -f "$temp_file"
    
    echo "Processed $processed_count attack attempts"
}

# Main function
main() {
    echo "Starting security log parser..."
    
    # Check if log file exists
    if [[ ! -f "$AUTH_LOG_PATH" ]]; then
        echo "Error: Auth log file not found: $AUTH_LOG_PATH" >&2
        exit 1
    fi
    
    # Check if required tools are available
    for tool in psql curl jq; do
        if ! command -v "$tool" &> /dev/null; then
            echo "Error: Required tool '$tool' not found" >&2
            exit 1
        fi
    done
    
    # Test database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "Error: Cannot connect to database" >&2
        exit 1
    fi
    
    # Parse the log file
    parse_auth_log "$AUTH_LOG_PATH"
    
    echo "Security log parsing completed"
}

# Run main function
main "$@"