CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    role ENUM('STUDENT','STAFF','ADMIN','TECHNICIAN') NOT NULL,
    provider ENUM('LOCAL','GOOGLE') DEFAULT 'LOCAL',
    provider_user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    capacity INT,
    status ENUM('AVAILABLE','BOOKED','UNDER_MAINTENANCE','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    user_id INT NOT NULL,

    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    purpose VARCHAR(255),
    expected_attendees INT,

    status ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',

    decision_reason VARCHAR(255),
    decided_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_resource
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id),

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),

    CONSTRAINT fk_decided_by_admin
        FOREIGN KEY (decided_by) REFERENCES users(user_id)
);

CREATE INDEX idx_resource_date ON bookings(resource_id, booking_date);
CREATE INDEX idx_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_status ON bookings(status);

--Incident tickets tables

ALTER TABLE resources
MODIFY COLUMN status ENUM('ACTIVE','AVAILABLE','UNAVAILABLE','MAINTENANCE')
NOT NULL DEFAULT 'AVAILABLE';

CREATE TABLE IF NOT EXISTS incident_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(30) NOT NULL UNIQUE,
    resource_id INT NULL,
    location_text VARCHAR(150) NULL,
    category ENUM(
        'ELECTRICAL',
        'NETWORK',
        'PROJECTOR',
        'COMPUTER',
        'FACILITY_DAMAGE',
        'PLUMBING',
        'AIR_CONDITIONING',
        'SAFETY',
        'OTHER'
    ) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
    preferred_contact_name VARCHAR(100) NULL,
    preferred_contact_email VARCHAR(150) NULL,
    preferred_contact_phone VARCHAR(30) NULL,
    status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') NOT NULL,
    rejection_reason VARCHAR(1000) NULL,
    resolution_notes VARCHAR(2000) NULL,
    created_by_id INT NOT NULL,
    assigned_technician_id INT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    resolved_at DATETIME NULL,
    closed_at DATETIME NULL,

    CONSTRAINT fk_ticket_resource
        FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
    CONSTRAINT fk_ticket_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(user_id),
    CONSTRAINT fk_ticket_assigned_tech
        FOREIGN KEY (assigned_technician_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    author_id INT NOT NULL,
    message VARCHAR(1000) NOT NULL,
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    CONSTRAINT fk_comment_ticket
        FOREIGN KEY (ticket_id) REFERENCES incident_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by_id INT NOT NULL,
    uploaded_at DATETIME NOT NULL,

    CONSTRAINT fk_attachment_ticket
        FOREIGN KEY (ticket_id) REFERENCES incident_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_uploaded_by
        FOREIGN KEY (uploaded_by_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    old_status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') NULL,
    new_status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') NOT NULL,
    changed_by_id INT NOT NULL,
    note VARCHAR(1000) NULL,
    changed_at DATETIME NOT NULL,

    CONSTRAINT fk_status_history_ticket
        FOREIGN KEY (ticket_id) REFERENCES incident_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_status_history_changed_by
        FOREIGN KEY (changed_by_id) REFERENCES users(user_id)
);

CREATE INDEX idx_incident_tickets_created_by ON incident_tickets(created_by_id);
CREATE INDEX idx_incident_tickets_assigned_technician ON incident_tickets(assigned_technician_id);
CREATE INDEX idx_incident_tickets_status ON incident_tickets(status);
CREATE INDEX idx_incident_tickets_resource ON incident_tickets(resource_id);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_status_history_ticket ON ticket_status_history(ticket_id);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    type ENUM(
        'TICKET_CREATED',
        'TICKET_ASSIGNED',
        'TICKET_STATUS_CHANGED',
        'NEW_COMMENT',
        'ACCOUNT_CREATED',
        'BOOKING_CREATED',
        'BOOKING_APPROVED',
        'BOOKING_REJECTED',
        'BOOKING_CANCELLED'
    ) NOT NULL,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(500) NOT NULL,
    reference_type VARCHAR(40),
    reference_id BIGINT,
    read_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(user_id)
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read_flag ON notifications(read_flag);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

ALTER TABLE notifications
MODIFY COLUMN type ENUM(
    'TICKET_CREATED',
    'TICKET_ASSIGNED',
    'TICKET_STATUS_CHANGED',
    'NEW_COMMENT'
) NOT NULL;