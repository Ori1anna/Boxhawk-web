-- Add new enum value for rejected reviews if it doesn't already exist
alter type review_status add value if not exists 'rejected';


