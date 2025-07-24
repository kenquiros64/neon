package services

import (
	"neon/core/constants"
	"neon/core/database/connections/embedded"
	"neon/core/models"
	"neon/core/repositories/local"
	"time"
)

// CounterService is a service for counting
type CounterService struct {
	localDB *embedded.CloverDB
}

// NewCounterService creates a new CounterService
func NewCounterService(localDB *embedded.CloverDB) *CounterService {
	return &CounterService{
		localDB: localDB,
	}
}

// GetAllCountsByKey returns all counts for a given key
// If there are no counts, it clears the database and returns an empty slice
func (c *CounterService) GetAllCountsByKey(key string) ([]models.Count, error) {
	repository := local.NewCountRepository(c.localDB)
	counts, err := repository.FindAllByPrefixKey(key)
	if err != nil {
		return nil, err
	}

	if len(counts) > 0 {
		return counts, nil
	}

	if err := repository.Clear(); err != nil {
		return nil, err
	}

	return counts, nil
}

// Increment increments the count for a given key
func (c *CounterService) Increment(key string) error {
	repository := local.NewCountRepository(c.localDB)
	count, err := repository.FindByKey(key)
	if err != nil {
		return err
	}

	if count == nil {
		count = &models.Count{
			Key:       key,
			Value:     1,
			LastReset: time.Now().Format(constants.DateLayout),
		}
		return repository.Insert(*count)
	}

	count.Value++
	return repository.Update(*count)
}
