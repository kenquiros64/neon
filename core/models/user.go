// Package models contains the models for the database
package models

// User is the model for the user table
type User struct {
	Username  string  `json:"username" bson:"username" clover:"username"`
	Password  string  `json:"password" bson:"password" clover:"password"`
	Name      string  `json:"name" bson:"name" clover:"name"`
	Role      string  `json:"role" bson:"role" clover:"role"`
	CreatedAt string  `json:"created_at" bson:"created_at" clover:"created_at"`
	UpdatedAt *string `json:"updated_at" bson:"updated_at" clover:"updated_at"`
}
