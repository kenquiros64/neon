// Package models contains the models for the database
package models

// User is the model for the user table
type User struct {
	Username  string  `json:"username"`
	Password  string  `json:"password"`
	Name      string  `json:"name"`
	Role      string  `json:"role"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt *string `json:"updated_at"`
}
