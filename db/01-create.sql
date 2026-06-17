-- ============================================================
--  CAPO — schema (MariaDB)
--  Hierarquia: Project -> Isometric -> Spool -> Joint -> Part
--  Part = PipeLength | Fitting (herança joined-table, PK partilhada)
--  Estágios: cut (pipe_lengths) / assembly (joints) / weld (welds)
--  Status atual denormalizado em cada item + trilha de eventos append-only.
-- ============================================================

-- ----- Utilizadores e papéis ----------------------------------

CREATE TABLE user
(
    id          INT                  NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100)         NOT NULL,
    password    VARCHAR(255)         NOT NULL,
    name        VARCHAR(60)          NOT NULL,
    birth_date  DATE                 NOT NULL,
    gender      ENUM ('M', 'F', 'O') NOT NULL,
    photo       VARCHAR(255),
    created_at  TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE role
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE user_role
(
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    INT          NOT NULL,
    role_id    INT          NOT NULL,
    document   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id),
    PRIMARY KEY (id)
);

-- ----- Dados de referência ------------------------------------

CREATE TABLE material
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE diameter
(
    id           INT           NOT NULL AUTO_INCREMENT,
    nominal_mm   DECIMAL(6, 2) NOT NULL,
    nominal_inch DECIMAL(5, 3) NOT NULL,
    created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (nominal_mm),
    PRIMARY KEY (id)
);

CREATE TABLE fitting_type
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE filler_material
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE wps
(
    id          INT           NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100)  NOT NULL,
    document    VARCHAR(255)  NOT NULL,
    tpi         DECIMAL(4, 2) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

-- ----- Desenho: projeto / isométrico / spool ------------------

CREATE TABLE project
(
    id          INT          NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100) NOT NULL,
    name        VARCHAR(60)  NOT NULL,
    client      VARCHAR(60)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE isometric
(
    id          INT          NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100) NOT NULL,
    project_id  INT          NOT NULL,
    document    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE spool
(
    id           INT          NOT NULL AUTO_INCREMENT,
    internal_id  VARCHAR(100) NOT NULL,
    isometric_id INT          NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

-- ----- Peças: part / pipe_length / fitting / port -------------

CREATE TABLE part
(
    id         INT                             NOT NULL AUTO_INCREMENT,
    type       ENUM ('pipe_length', 'fitting') NOT NULL,
    number     VARCHAR(10)                     NOT NULL,
    created_at TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE pipe_length
(
    id          INT                                  NOT NULL,
    internal_id VARCHAR(100)                         NOT NULL,
    description VARCHAR(100)                         NOT NULL,
    length      DECIMAL(8, 2)                        NOT NULL,
    thickness   DECIMAL(5, 2)                        NOT NULL,
    heat_number VARCHAR(100),
    material_id INT                                  NOT NULL,
    diameter_id INT                                  NOT NULL,
    status      ENUM ('to_do', 'in_progress', 'done') NOT NULL DEFAULT 'to_do',
    created_at  TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE fitting
(
    id              INT           NOT NULL,
    internal_id     VARCHAR(100)  NOT NULL,
    description     VARCHAR(100)  NOT NULL,
    length          DECIMAL(8, 2) NOT NULL,
    thickness       DECIMAL(5, 2) NOT NULL,
    heat_number     VARCHAR(100),
    material_id     INT           NOT NULL,
    fitting_type_id INT           NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE port
(
    id          INT       NOT NULL AUTO_INCREMENT,
    number      INT       NOT NULL,
    fitting_id  INT       NOT NULL,
    diameter_id INT       NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (fitting_id, number),
    PRIMARY KEY (id)
);

-- ----- Montagem e solda: joint / weld -------------------------

CREATE TABLE joint
(
    id         INT                  NOT NULL AUTO_INCREMENT,
    part1_id   INT                  NOT NULL,
    part2_id   INT                  NOT NULL,
    spool_id   INT                  NOT NULL,
    status     ENUM ('to_do', 'done') NOT NULL DEFAULT 'to_do',
    created_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld
(
    id                 INT                  NOT NULL AUTO_INCREMENT,
    number             VARCHAR(10)          NOT NULL,
    joint_id           INT                  NOT NULL,
    filler_material_id INT,
    wps_id             INT,
    status             ENUM ('to_do', 'done') NOT NULL DEFAULT 'to_do',
    created_at         TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ----- Trilha de eventos de status (append-only) --------------

CREATE TABLE pipe_length_status_event
(
    id             INT                                  NOT NULL AUTO_INCREMENT,
    pipe_length_id INT                                  NOT NULL,
    status         ENUM ('to_do', 'in_progress', 'done') NOT NULL,
    notes          TEXT,
    created_by_id  INT,
    created_at     TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE joint_status_event
(
    id            INT                  NOT NULL AUTO_INCREMENT,
    joint_id      INT                  NOT NULL,
    status        ENUM ('to_do', 'done') NOT NULL,
    notes         TEXT,
    created_by_id INT,
    created_at    TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld_status_event
(
    id            INT                  NOT NULL AUTO_INCREMENT,
    weld_id       INT                  NOT NULL,
    status        ENUM ('to_do', 'done') NOT NULL,
    notes         TEXT,
    created_by_id INT,
    created_at    TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ----- Ordens de trabalho (status derivado dos itens) ---------
--  claimed_by_id / claimed_at: lock exclusivo (claimer ou admin).

CREATE TABLE cut_list
(
    id            INT          NOT NULL AUTO_INCREMENT,
    internal_id   VARCHAR(100) NOT NULL,
    isometric_id  INT          NOT NULL,
    claimed_by_id INT,
    claimed_at    TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    UNIQUE (isometric_id),
    PRIMARY KEY (id)
);

CREATE TABLE assembly_list
(
    id            INT          NOT NULL AUTO_INCREMENT,
    internal_id   VARCHAR(100) NOT NULL,
    isometric_id  INT          NOT NULL,
    claimed_by_id INT,
    claimed_at    TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    UNIQUE (isometric_id),
    PRIMARY KEY (id)
);

CREATE TABLE weld_list
(
    id            INT          NOT NULL AUTO_INCREMENT,
    internal_id   VARCHAR(100) NOT NULL,
    spool_id      INT          NOT NULL,
    claimed_by_id INT,
    claimed_at    TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    UNIQUE (spool_id),
    PRIMARY KEY (id)
);

-- ============================================================
--  Constraints (CHECK + FK)
-- ============================================================

ALTER TABLE diameter
    ADD CONSTRAINT chk_nominal_mm_positive CHECK (nominal_mm > 0),
    ADD CONSTRAINT chk_nominal_inch_positive CHECK (nominal_inch > 0);

ALTER TABLE wps
    ADD CONSTRAINT chk_tpi_positive CHECK (tpi > 0);

ALTER TABLE user_role
    ADD FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE;

ALTER TABLE isometric
    ADD FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE;

ALTER TABLE spool
    ADD FOREIGN KEY (isometric_id) REFERENCES isometric (id) ON DELETE CASCADE;

ALTER TABLE pipe_length
    ADD FOREIGN KEY (id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (material_id) REFERENCES material (id),
    ADD FOREIGN KEY (diameter_id) REFERENCES diameter (id),
    ADD CONSTRAINT chk_pipe_length_length_positive CHECK (length > 0),
    ADD CONSTRAINT chk_pipe_length_thickness_positive CHECK (thickness > 0);

ALTER TABLE fitting
    ADD FOREIGN KEY (id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (material_id) REFERENCES material (id),
    ADD FOREIGN KEY (fitting_type_id) REFERENCES fitting_type (id),
    ADD CONSTRAINT chk_fitting_length_positive CHECK (length > 0),
    ADD CONSTRAINT chk_fitting_thickness_positive CHECK (thickness > 0);

ALTER TABLE port
    ADD FOREIGN KEY (fitting_id) REFERENCES fitting (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (diameter_id) REFERENCES diameter (id);

ALTER TABLE joint
    ADD FOREIGN KEY (part1_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (part2_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE,
    ADD CONSTRAINT chk_different_parts CHECK (part1_id != part2_id);

ALTER TABLE weld
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (filler_material_id) REFERENCES filler_material (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (wps_id) REFERENCES wps (id) ON DELETE SET NULL;

ALTER TABLE pipe_length_status_event
    ADD FOREIGN KEY (pipe_length_id) REFERENCES pipe_length (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE joint_status_event
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE weld_status_event
    ADD FOREIGN KEY (weld_id) REFERENCES weld (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE cut_list
    ADD FOREIGN KEY (isometric_id) REFERENCES isometric (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (claimed_by_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE assembly_list
    ADD FOREIGN KEY (isometric_id) REFERENCES isometric (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (claimed_by_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE weld_list
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (claimed_by_id) REFERENCES user (id) ON DELETE SET NULL;

-- ============================================================
--  Índices (além dos criados implicitamente por PK/UNIQUE/FK)
-- ============================================================

CREATE INDEX idx_part_type ON part (type);
CREATE INDEX idx_part_number ON part (number);

CREATE INDEX idx_pipe_length_status ON pipe_length (status);
CREATE INDEX idx_pipe_length_heat_number ON pipe_length (heat_number);
CREATE INDEX idx_pipe_length_material_id ON pipe_length (material_id);
CREATE INDEX idx_pipe_length_diameter_id ON pipe_length (diameter_id);

CREATE INDEX idx_fitting_heat_number ON fitting (heat_number);
CREATE INDEX idx_fitting_material_id ON fitting (material_id);
CREATE INDEX idx_fitting_fitting_type_id ON fitting (fitting_type_id);

CREATE INDEX idx_port_fitting_id ON port (fitting_id);
CREATE INDEX idx_port_diameter_id ON port (diameter_id);

CREATE INDEX idx_project_name ON project (name);
CREATE INDEX idx_project_client ON project (client);

CREATE INDEX idx_isometric_project_id ON isometric (project_id);
CREATE INDEX idx_spool_isometric_id ON spool (isometric_id);

CREATE INDEX idx_joint_status ON joint (status);
CREATE INDEX idx_joint_part1_id ON joint (part1_id);
CREATE INDEX idx_joint_part2_id ON joint (part2_id);
CREATE INDEX idx_joint_spool_id ON joint (spool_id);

CREATE INDEX idx_weld_status ON weld (status);
CREATE INDEX idx_weld_joint_id ON weld (joint_id);
CREATE INDEX idx_weld_filler_material_id ON weld (filler_material_id);
CREATE INDEX idx_weld_wps_id ON weld (wps_id);

CREATE INDEX idx_pipe_length_status_event_composite ON pipe_length_status_event (pipe_length_id, created_at);
CREATE INDEX idx_pipe_length_status_event_created_by ON pipe_length_status_event (created_by_id);
CREATE INDEX idx_joint_status_event_composite ON joint_status_event (joint_id, created_at);
CREATE INDEX idx_joint_status_event_created_by ON joint_status_event (created_by_id);
CREATE INDEX idx_weld_status_event_composite ON weld_status_event (weld_id, created_at);
CREATE INDEX idx_weld_status_event_created_by ON weld_status_event (created_by_id);

CREATE INDEX idx_cut_list_claimed_by ON cut_list (claimed_by_id);
CREATE INDEX idx_assembly_list_claimed_by ON assembly_list (claimed_by_id);
CREATE INDEX idx_weld_list_claimed_by ON weld_list (claimed_by_id);

CREATE INDEX idx_user_role_user_id ON user_role (user_id);
CREATE INDEX idx_user_role_role_id ON user_role (role_id);
CREATE INDEX idx_diameter_nominal_inch ON diameter (nominal_inch);
