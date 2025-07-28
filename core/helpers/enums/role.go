package enums

// Role is a type that represents the different roles for a user
type Role string

const (
	// Admin is the admin role
	Admin Role = "admin"
	// User is the user role
	User Role = "user"
)

// AllRoles is a list of all the roles
var AllRoles = []struct {
	Value    Role
	RoleName string
}{
	{Admin, "ADMIN"},
	{User, "USER"},
}
