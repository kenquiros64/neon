package helpers

import "errors"

// ErrUserNotFound is the error returned when a user is not found
var ErrUserNotFound = errors.New("USER_NOT_FOUND")

// ErrRowNotFound is the error returned when a row is not found
var ErrRowNotFound = errors.New("ROW_NOT_FOUND")

// ErrUserAlreadyExists is the error returned when a user already exists
var ErrUserAlreadyExists = errors.New("USER_ALREADY_EXISTS")

// ErrUserInvalidPassword is the error returned when a user's password is invalid
var ErrUserInvalidPassword = errors.New("USER_INVALID_PASSWORD")

// ErrNoInternetConnection is the error returned when there is no internet connection
var ErrNoInternetConnection = errors.New("NO_INTERNET_CONNECTION")

// ErrInvalidRequest is the error returned when a request is invalid
var ErrInvalidRequest = errors.New("INVALID_REQUEST")

// ErrTicketAlreadyClosed is the error returned when a ticket is already closed
var ErrTicketAlreadyClosed = errors.New("TICKET_ALREADY_CLOSED")

// ErrTicketAlreadyNullified is the error returned when a ticket is already nullified
var ErrTicketAlreadyNullified = errors.New("TICKET_ALREADY_NULLIFIED")

// ErrTicketNotBelongToReport is the error returned when a ticket is not belong to a report
var ErrTicketNotBelongToReport = errors.New("TICKET_NOT_BELONG_TO_REPORT")

// ErrRouteIsEmpty is the error returned when a route is empty
var ErrRouteIsEmpty = errors.New("ROUTE_IS_EMPTY")
