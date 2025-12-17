export const SCHEMAS = [
  {
    id: "ADVERTISING_CAMPAIGNS",
    columnCount: 8,
    description: "Contains information about advertising campaigns including campaign details, targeting parameters, and performance metrics.",
    columns: [
      {
        name: "campaign_id",
        type: "VARCHAR",
        usage: "Primary Key",
        comment: "Unique identifier for each campaign",
        examples: "CAMP_001, CAMP_002"
      },
      {
        name: "campaign_name",
        type: "VARCHAR",
        usage: "Campaign Name",
        comment: "Display name of the advertising campaign",
        examples: "Summer Sale 2024, Holiday Promo"
      },
      {
        name: "start_date",
        type: "DATE",
        usage: "Campaign Start",
        comment: "Date when campaign becomes active",
        examples: "2024-01-01, 2024-06-15"
      },
      {
        name: "end_date",
        type: "DATE",
        usage: "Campaign End",
        comment: "Date when campaign ends",
        examples: "2024-01-31, 2024-07-15"
      },
      {
        name: "budget",
        type: "DECIMAL(10,2)",
        usage: "Budget Amount",
        comment: "Total budget allocated for campaign",
        examples: "10000.00, 50000.00"
      },
      {
        name: "target_audience",
        type: "VARCHAR",
        usage: "Targeting",
        comment: "Description of target audience",
        examples: "Adults 25-45, Business travelers"
      },
      {
        name: "impressions",
        type: "INTEGER",
        usage: "Metrics",
        comment: "Total number of ad impressions",
        examples: "1000000, 5000000"
      },
      {
        name: "clicks",
        type: "INTEGER",
        usage: "Metrics",
        comment: "Total number of clicks on ads",
        examples: "50000, 250000"
      }
    ]
  },
  {
    id: "FLIGHT_ROUTES",
    columnCount: 6,
    description: "Information about flight routes including origin, destination, and route characteristics.",
    columns: [
      {
        name: "route_id",
        type: "VARCHAR",
        usage: "Primary Key",
        comment: "Unique identifier for each route",
        examples: "RT_001, RT_002"
      },
      {
        name: "origin_airport",
        type: "VARCHAR(3)",
        usage: "Origin",
        comment: "IATA code of origin airport",
        examples: "JFK, LAX"
      },
      {
        name: "destination_airport",
        type: "VARCHAR(3)",
        usage: "Destination",
        comment: "IATA code of destination airport",
        examples: "LHR, CDG"
      },
      {
        name: "distance_km",
        type: "INTEGER",
        usage: "Distance",
        comment: "Distance between airports in kilometers",
        examples: "5500, 8900"
      },
      {
        name: "avg_flight_time",
        type: "INTEGER",
        usage: "Duration",
        comment: "Average flight time in minutes",
        examples: "420, 540"
      },
      {
        name: "is_active",
        type: "BOOLEAN",
        usage: "Status",
        comment: "Whether route is currently active",
        examples: "true, false"
      }
    ]
  }
];