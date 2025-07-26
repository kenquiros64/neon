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

// GetAllCountsFromToday returns all counts from today
func (c *CounterService) GetAllCountsFromToday() ([]models.Count, error) {
	repository := local.NewCountRepository(c.localDB)
	counts, err := repository.FindByDate(time.Now().Format(constants.DateLayout))
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
func (c *CounterService) Increment(key string) (models.Count, error) {
	repository := local.NewCountRepository(c.localDB)
	count, err := repository.FindByKey(key)
	if err != nil {
		return *count, err
	}

	if count == nil {
		count = &models.Count{
			Key:       key,
			Value:     1,
			LastReset: time.Now().Format(constants.DateLayout),
		}
		if err := repository.Insert(*count); err != nil {
			return *count, err
		}
		return *count, nil
	}

	count.Value++
	count.LastReset = time.Now().Format(constants.DateLayout)

	if err := repository.Update(*count); err != nil {
		return *count, err
	}
	return *count, nil
}
