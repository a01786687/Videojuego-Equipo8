-- Creaciones de view
ALTER VIEW sampleView as
SELECT X.run_session_id AS session_id, COUNT(X.run_id) as totalRunPerSession
FROM anura.runs AS X
GROUP BY run_session_id;
 
SELECT * FROM anura.sampleView;

-- Implementacion runs per user USAR EN ENDPOINTS
SELECT X.session_user_id, Y.username, SUM(Z.totalRunPerSession)
FROM anura.sessions AS X INNER JOIN anura.sampleView AS Z
USING (session_id)
INNER JOIN anura.users AS Y
ON session_user_id = user_id
GROUP BY (user_id);