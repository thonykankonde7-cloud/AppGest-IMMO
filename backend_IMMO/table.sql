-- =========================
-- AGENCIES
-- =========================
CREATE TABLE agencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  address TEXT,
  logo VARCHAR(255),
  status ENUM('active','inactive','blocked','pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  agency_id INT NULL,

  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30),

  password VARCHAR(255) NULL,

  google_id VARCHAR(255) NULL,
  avatar VARCHAR(255) NULL,

  auth_provider ENUM('local','google') DEFAULT 'local',

  role ENUM('super_admin','admin','agent','manager','tenant') DEFAULT 'tenant',

  status ENUM('active','inactive','blocked') DEFAULT 'active',

  email_verified BOOLEAN DEFAULT FALSE,

  last_login DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_email (email),

  KEY idx_agency (agency_id),
  KEY idx_role (role),

  FOREIGN KEY (agency_id) REFERENCES agencies(id)
  ON DELETE SET NULL
) ENGINE=InnoDB;
ALTER TABLE users
ADD COLUMN is_owner TINYINT(1) DEFAULT 0;


-- =========================
-- OWNER LINK
-- =========================
ALTER TABLE agencies ADD owner_id INT NULL;

ALTER TABLE agencies
ADD CONSTRAINT fk_agency_owner
FOREIGN KEY (owner_id) REFERENCES users(id)
ON DELETE SET NULL;

-- INSERT USERS SUPER ADMIN
INSERT INTO users (
  agency_id,
  fullname,
  email,
  password,
  role,
  status
)
VALUES (
  NULL,
  'ThonyDev',
  'thonykankonde7@gmail.com',
  '$2b$10$B4OVBY1giXsxFfEZshab9u2MIN6eHEeBr0UVaXfayUg0qLSv57/Xy',
  'super_admin',
  'active'
);


-- =========================
-- BUILDINGS
-- =========================
CREATE TABLE buildings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),

  total_floors INT DEFAULT 0,
  description TEXT,

  status ENUM('active','inactive') DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id)
  ON DELETE CASCADE
);

-- =========================
-- APARTMENTS
-- =========================
CREATE TABLE apartments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  agency_id INT NOT NULL,
  building_id INT NOT NULL,

  number VARCHAR(50) NOT NULL,
  floor INT,
  type VARCHAR(100),

  rooms INT DEFAULT 1,

  rent DECIMAL(10,2) NOT NULL,
  charges DECIMAL(10,2) DEFAULT 0,

  status ENUM('available','occupied','maintenance') DEFAULT 'available',

  description TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_apartment (agency_id, building_id, number),

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

-- =========================
-- TENANTS
-- =========================
CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,

  agency_id INT NOT NULL,
  user_id INT NULL,

  fullname VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(150),
  address TEXT,
  id_card VARCHAR(100),

  apartment_id INT NULL,

  contract_start DATE,
  contract_end DATE,

  rent DECIMAL(10,2),
  deposit DECIMAL(10,2) DEFAULT 0,

  status ENUM('active','inactive','pending','terminated') DEFAULT 'active',

  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

-- =========================
-- SUBCRIPTION PAYMENTS
-- =========================
CREATE TABLE subscription_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    agency_id INT NOT NULL,
    subscription_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_method ENUM(
        'mobile_money',
        'bank_transfer',
        'card',
        'cash'
    ) NOT NULL,

    transaction_reference VARCHAR(150) NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    payment_date DATETIME NOT NULL,

    status ENUM(
        'pending',
        'completed',
        'rejected',
        'cancelled'
    ) DEFAULT 'pending',

    rejection_reason TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    approved_by INT NULL,
    phone_number VARCHAR(30) NULL,

    CONSTRAINT fk_subscription_payment_agency
        FOREIGN KEY (agency_id)
        REFERENCES agencies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subscription_payment_subscription
        FOREIGN KEY (subscription_id)
        REFERENCES subscriptions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subscription_payment_user
        FOREIGN KEY (approved_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================
-- BILLS
-- =========================
CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,
  tenant_id INT NOT NULL,
  apartment_id INT NULL,

  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,

  status ENUM('paid','unpaid','partial') DEFAULT 'unpaid',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  bill_id INT NOT NULL,
  tenant_id INT NOT NULL,

  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,

  payment_method ENUM('cash','bank','mobile_money','card') DEFAULT 'cash',

  status ENUM('completed','pending','failed') DEFAULT 'completed',

  reference VARCHAR(100) NULL,
  note TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- EXPENSES (DEPENSES)
-- =========================
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  title VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  expense_date DATE,
  description TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  title VARCHAR(255),
  message TEXT,
  type ENUM('info','warning','success','error') DEFAULT 'info',

  is_read BOOLEAN DEFAULT FALSE,
  user_id INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

ALTER TABLE notifications 
ADD target_user_id INT NULL;

) ENGINE=InnoDB;

-- =========================
-- DOCUMENTS
-- =========================
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  type ENUM('contract','invoice','id_card','receipt','other') DEFAULT 'other',

  tenant_id INT NULL,
  apartment_id INT NULL,
  building_id INT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL
);

-- =========================
-- SETTINGS (PARAMETRES)
-- =========================
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agency_id INT NOT NULL,

  setting_key VARCHAR(100),
  setting_value TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_setting (agency_id, setting_key),

  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(50),
      permission VARCHAR(100)
 );

-- =========================
-- AUDIT LOGS
-- =========================
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT,
  agency_id INT,

  action VARCHAR(100),        -- CREATE_USER, UPDATE_USER, DELETE_USER
  entity VARCHAR(100),        -- users, agencies, payments
  entity_id INT,

  description TEXT,

  ip_address VARCHAR(50),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
)ENGINE=InnoDB;

CREATE TABLE subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    price DECIMAL(10,2) DEFAULT 0,

    max_buildings INT DEFAULT 1,
    max_apartments INT DEFAULT 10,
    max_users INT DEFAULT 5,

    support_type ENUM(
        'standard',
        'priority',
        '24/7'
    ) DEFAULT 'standard',

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE subscription_plans
ADD COLUMN icon VARCHAR(100) NULL;

--- SAAS SETTINGS ---
CREATE TABLE saas_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    app_name VARCHAR(150) DEFAULT 'AppGest IMMO',
    support_email VARCHAR(150),
    support_phone VARCHAR(50),

    currency ENUM('USD','CDF','EUR') DEFAULT 'USD',
    tax DECIMAL(5,2) DEFAULT 0,
    trial_days INT DEFAULT 7,

    google_login BOOLEAN DEFAULT TRUE,
    email_login BOOLEAN DEFAULT TRUE,
    registration_open BOOLEAN DEFAULT TRUE,

    allow_free_plan BOOLEAN DEFAULT FALSE,
    auto_suspend BOOLEAN DEFAULT TRUE,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE subscription_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  agency_id INT NOT NULL,
  plan_id INT NOT NULL,

  amount DECIMAL(12,2) NOT NULL DEFAULT 0,

  payment_method ENUM(
    'cash',
    'mobile_money',
    'bank_transfer',
    'card'
  ) DEFAULT 'mobile_money',

  transaction_id VARCHAR(255) NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  payment_date TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP,

  status ENUM(
    'pending',
    'completed',
    'failed',
    'cancelled'
  ) DEFAULT 'pending',

  notes TEXT NULL,

  created_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP
  DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_subscription_payment_agency
  FOREIGN KEY (agency_id)
  REFERENCES agencies(id)
  ON DELETE CASCADE,

  CONSTRAINT fk_subscription_payment_plan
  FOREIGN KEY (plan_id)
  REFERENCES subscription_plans(id)
  ON DELETE CASCADE
);
ALTER TABLE subscription_payments
ADD COLUMN method VARCHAR(50) NULL;
INSERT INTO subscription_payments (
  agency_id,
  plan_id,
  amount,
  payment_method,
  phone_number,
  transaction_id,
  start_date,
  end_date,
  status
)
VALUES
(
  3,
  4,
  9.00,
  'mobile_money',

  'MOMO-001',
  '2026-03-01',
  '2026-04-01',
  'completed'
),
(
  3,
  5,
  29.00,
  'bank_transfer',
  'BANK-002',
  '2026-05-01',
  '2026-06-01',
  'completed'
),
(
  1,
  6,
  99.00,
  'card',
  'CARD-003',
  '2026-03-01',
  '2026-04-01',
  'completed'
);
-- PORTE FEUILLE
CREATE TABLE saas_wallet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_earned DECIMAL(12,2) DEFAULT 0,
  total_withdrawn DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- RETRAIT
CREATE TABLE saas_withdrawals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(12,2),
  method ENUM('mobile_money','bank_transfer','cash'),
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE saas_withdrawals
ADD COLUMN requested_by INT NULL;

ALTER TABLE saas_withdrawals
ADD CONSTRAINT fk_withdraw_user
FOREIGN KEY (requested_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE saas_withdrawals
ADD COLUMN agency_id INT NULL;

ALTER TABLE saas_withdrawals
ADD COLUMN phone_number VARCHAR(30) NULL;

ALTER TABLE saas_withdrawals
MODIFY COLUMN method ENUM(
  'mpesa',
  'airtel_money',
  'orange_money',
  'cash',
  'bank_transfer'
) NOT NULL;

UPDATE saas_withdrawals
SET status = 'approved'
WHERE id = 1;

--------------

-- =========================
-- INDEX (PERFORMANCE)
-- =========================
CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_tenants_agency ON tenants(agency_id);
CREATE INDEX idx_bills_agency ON bills(agency_id);
CREATE INDEX idx_payments_agency ON payments(agency_id);
CREATE INDEX idx_expenses_agency ON expenses(agency_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);


