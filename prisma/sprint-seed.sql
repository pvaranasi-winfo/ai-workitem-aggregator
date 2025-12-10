-- Sprint Management Seed Data
-- Run this SQL to populate sprint data for testing

-- Insert sample sprints
INSERT INTO "Sprint" (
  "projectId", 
  name, 
  goal, 
  "startDate", 
  "endDate", 
  status, 
  velocity, 
  capacity, 
  commitment,
  "createdAt",
  "updatedAt"
) VALUES 
-- Active Sprint for Project 1
(
  1,
  'Sprint 12 - Q1 2025',
  'Complete user authentication refactor and implement role-based permissions',
  '2025-01-20'::date,
  '2025-02-03'::date,
  'Active',
  45,
  160,
  50,
  NOW(),
  NOW()
),
-- Planning Sprint for Project 1
(
  1,
  'Sprint 13 - Q1 2025',
  'Develop advanced reporting features and dashboards',
  '2025-02-03'::date,
  '2025-02-17'::date,
  'Planning',
  NULL,
  160,
  55,
  NOW(),
  NOW()
),
-- Completed Sprint for Project 2
(
  2,
  'Sprint 8 - Dec 2024',
  'API integration improvements and performance optimization',
  '2024-12-16'::date,
  '2024-12-30'::date,
  'Completed',
  38,
  144,
  40,
  NOW(),
  NOW()
),
-- Active Sprint for Project 2
(
  2,
  'Sprint 9 - Jan 2025',
  'Mobile responsiveness and UI/UX enhancements',
  '2025-01-13'::date,
  '2025-01-27'::date,
  'Active',
  42,
  144,
  45,
  NOW(),
  NOW()
);

-- Get the sprint IDs we just created
DO $$
DECLARE
  sprint_12_id INT;
  sprint_13_id INT;
  sprint_8_id INT;
  sprint_9_id INT;
  ticket_ids INT[];
  user_ids INT[];
BEGIN
  -- Get sprint IDs
  SELECT id INTO sprint_12_id FROM "Sprint" WHERE name = 'Sprint 12 - Q1 2025';
  SELECT id INTO sprint_13_id FROM "Sprint" WHERE name = 'Sprint 13 - Q1 2025';
  SELECT id INTO sprint_8_id FROM "Sprint" WHERE name = 'Sprint 8 - Dec 2024';
  SELECT id INTO sprint_9_id FROM "Sprint" WHERE name = 'Sprint 9 - Jan 2025';

  -- Get some ticket IDs (assuming tickets exist from previous seeds)
  SELECT ARRAY_AGG(id) INTO ticket_ids FROM "Ticket" LIMIT 20;

  -- Get user IDs
  SELECT ARRAY_AGG(id) INTO user_ids FROM "User" LIMIT 5;

  -- Add tickets to Sprint 12 (Active)
  IF array_length(ticket_ids, 1) >= 8 THEN
    INSERT INTO "SprintTicket" ("sprintId", "ticketId", "storyPoints", status, "addedAt")
    VALUES
      (sprint_12_id, ticket_ids[1], 8, 'Done', NOW() - INTERVAL '10 days'),
      (sprint_12_id, ticket_ids[2], 5, 'Done', NOW() - INTERVAL '10 days'),
      (sprint_12_id, ticket_ids[3], 13, 'InProgress', NOW() - INTERVAL '8 days'),
      (sprint_12_id, ticket_ids[4], 3, 'InProgress', NOW() - INTERVAL '6 days'),
      (sprint_12_id, ticket_ids[5], 5, 'Todo', NOW() - INTERVAL '5 days'),
      (sprint_12_id, ticket_ids[6], 8, 'Todo', NOW() - INTERVAL '5 days');
  END IF;

  -- Add tickets to Sprint 13 (Planning)
  IF array_length(ticket_ids, 1) >= 15 THEN
    INSERT INTO "SprintTicket" ("sprintId", "ticketId", "storyPoints", status, "addedAt")
    VALUES
      (sprint_13_id, ticket_ids[7], 8, 'Todo', NOW()),
      (sprint_13_id, ticket_ids[8], 13, 'Todo', NOW()),
      (sprint_13_id, ticket_ids[9], 5, 'Todo', NOW()),
      (sprint_13_id, ticket_ids[10], 8, 'Todo', NOW());
  END IF;

  -- Add tickets to Sprint 8 (Completed)
  IF array_length(ticket_ids, 1) >= 20 THEN
    INSERT INTO "SprintTicket" ("sprintId", "ticketId", "storyPoints", status, "addedAt", "completedAt")
    VALUES
      (sprint_8_id, ticket_ids[11], 5, 'Done', NOW() - INTERVAL '20 days', NOW() - INTERVAL '16 days'),
      (sprint_8_id, ticket_ids[12], 8, 'Done', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days'),
      (sprint_8_id, ticket_ids[13], 13, 'Done', NOW() - INTERVAL '20 days', NOW() - INTERVAL '14 days'),
      (sprint_8_id, ticket_ids[14], 5, 'Done', NOW() - INTERVAL '20 days', NOW() - INTERVAL '14 days'),
      (sprint_8_id, ticket_ids[15], 8, 'Done', NOW() - INTERVAL '19 days', NOW() - INTERVAL '13 days');
  END IF;

  -- Add Retrospective items for Sprint 8
  IF array_length(user_ids, 1) >= 3 THEN
    INSERT INTO "Retrospective" ("sprintId", type, content, votes, status, "assigneeId", "createdAt")
    VALUES
      (sprint_8_id, 'WentWell', 'Team collaboration was excellent during this sprint', 5, NULL, NULL, NOW() - INTERVAL '14 days'),
      (sprint_8_id, 'WentWell', 'Successfully completed all critical bug fixes', 3, NULL, NULL, NOW() - INTERVAL '14 days'),
      (sprint_8_id, 'NeedsImprovement', 'API documentation needs to be updated more frequently', 4, NULL, NULL, NOW() - INTERVAL '14 days'),
      (sprint_8_id, 'NeedsImprovement', 'Code review process took longer than expected', 2, NULL, NULL, NOW() - INTERVAL '14 days'),
      (sprint_8_id, 'ActionItem', 'Schedule documentation workshop for next sprint', 0, 'Open', user_ids[1], NOW() - INTERVAL '14 days'),
      (sprint_8_id, 'ActionItem', 'Implement automated code review checklist', 0, 'InProgress', user_ids[2], NOW() - INTERVAL '14 days');
  END IF;

  -- Add Daily Standups for Sprint 12 (Active)
  IF array_length(user_ids, 1) >= 3 THEN
    -- Today's standup
    INSERT INTO "DailyStandup" ("sprintId", "userId", date, yesterday, today, blockers)
    VALUES
      (sprint_12_id, user_ids[1], CURRENT_DATE, 'Completed authentication API endpoints', 'Working on role-based permissions', NULL),
      (sprint_12_id, user_ids[2], CURRENT_DATE, 'Fixed critical security vulnerability', 'Implementing permission middleware', 'Waiting for security audit approval'),
      (sprint_12_id, user_ids[3], CURRENT_DATE, 'Updated user dashboard UI', 'Adding permission toggles to admin panel', NULL);

    -- Yesterday's standup
    INSERT INTO "DailyStandup" ("sprintId", "userId", date, yesterday, today, blockers)
    VALUES
      (sprint_12_id, user_ids[1], CURRENT_DATE - INTERVAL '1 day', 'Reviewed authentication architecture', 'Completing authentication API endpoints', NULL),
      (sprint_12_id, user_ids[2], CURRENT_DATE - INTERVAL '1 day', 'Started security vulnerability scan', 'Fixing critical security vulnerability', 'Need input from DevOps team'),
      (sprint_12_id, user_ids[3], CURRENT_DATE - INTERVAL '1 day', 'Designed new dashboard layout', 'Updating user dashboard UI', NULL);
  END IF;

END $$;

-- Display created sprints
SELECT 
  s.id,
  s.name,
  s.status,
  s."startDate",
  s."endDate",
  p.name as project,
  COUNT(st.id) as ticket_count
FROM "Sprint" s
LEFT JOIN "Project" p ON s."projectId" = p.id
LEFT JOIN "SprintTicket" st ON s.id = st."sprintId"
GROUP BY s.id, s.name, s.status, s."startDate", s."endDate", p.name
ORDER BY s."startDate" DESC;
