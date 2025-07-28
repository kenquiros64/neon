package local

import (
	"neon/core/constants"

	"github.com/doug-martin/goqu/v9"
)

var (
	// TableTickets is the table name for the tickets table
	TableTickets = goqu.T(constants.TicketsTable)
	// TableReports is the table name for the reports table
	TableReports = goqu.T(constants.ReportsTable)

	// ColumnID is the column name for the id column
	ColumnID = goqu.C("id")

	// ColumnReportID is the column name for the report_id column
	ColumnReportID = goqu.C("report_id")

	// ColumnStatus is the column name for the status column
	ColumnStatus = goqu.C("status")

	// ColumnLastReset is the column name for the last_reset column
	ColumnLastReset = "last_reset"

	// ColumnKey is the column name for the key column
	ColumnKey = "key"

	// ColumnUsername is the column name for the username column
	ColumnUsername = "username"

	dialect = goqu.Dialect("sqlite3")
)
