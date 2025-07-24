package helpers

import (
	"encoding/json"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"

	c "github.com/ostafen/clover/v2/document"
)

// SelectRelatedDataByForeignKey loads any related slice by filtering on a foreign key.
func SelectRelatedDataByForeignKey[T any](
	db *goqu.Database,
	table exp.IdentifierExpression,
	column exp.IdentifierExpression,
	key any,
) ([]T, error) {
	var result []T
	err := db.From(table).
		Where(column.Eq(key)).
		ScanStructs(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to load from %s: %w", table, err)
	}
	return result, nil
}

// MarshalAsCloverDocument marshals a struct as a clover document
func MarshalAsCloverDocument[T any](data T) (*c.Document, error) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal route: %w", err)
	}

	var result map[string]interface{}
	err = json.Unmarshal(bytes, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal route: %w", err)
	}

	doc := c.NewDocument()
	doc.SetAll(result)

	return doc, nil
}
