# Open issues/todos
## General
- Ignored text ellipsis on the hole project due to time limitations
  - Should be on all tables
- Mobile optimization: Not much work in here - responsiveness is at a minimal currently

## Login
- Password field width - gap too large

## Dashboard
### User List / Management
- Pagination should be processed on backend - currently faked
- Search should be on backend aswell - currently in frontend

### Add User
- DropDown should be the Select Component (deprecation warning)
- DropDown container has a bad width - should be equal to the parent

### Edit User
- Editing emails has been disabled for simplicity - brings too much work with validation

### Delete User
- Deleting yourself is not possible - saved time caring for auto logout
- Deleting in general: no auto logout if you delete someone who's currently logged in

## Security Insights
- Would generally add a menu-bar with filters (ristrict everything to one country / ip range etc)
- No cron job running - executing it manually to have _some_ data present (server has limited computation power)
- Line chart is not responding to size changes - no responsiveness at all
- Recent Attack Attempts Table is lacking features (sorting etc)

