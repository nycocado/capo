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

CREATE TABLE fitting_type
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE work_status_type
(
    id         INT         NOT NULL AUTO_INCREMENT,
    name       VARCHAR(60) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (name),
    PRIMARY KEY (id)
);

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
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE cut_list
(
    id           INT          NOT NULL AUTO_INCREMENT,
    internal_id  VARCHAR(100) NOT NULL,
    isometric_id INT          NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE assembly_list
(
    id           INT          NOT NULL AUTO_INCREMENT,
    internal_id  VARCHAR(100) NOT NULL,
    isometric_id INT          NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

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
    id          INT           NOT NULL,
    internal_id VARCHAR(100)  NOT NULL,
    description VARCHAR(100)  NOT NULL,
    length      DECIMAL(8, 2) NOT NULL,
    thickness   DECIMAL(5, 2) NOT NULL,
    heat_number VARCHAR(100),
    material_id INT           NOT NULL,
    diameter_id INT           NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

CREATE TABLE sheet
(
    id           INT       NOT NULL AUTO_INCREMENT,
    number       INT       NOT NULL,
    isometric_id INT       NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (isometric_id, number),
    PRIMARY KEY (id)
);

CREATE TABLE rev
(
    id              INT          NOT NULL AUTO_INCREMENT,
    document        VARCHAR(100) NOT NULL,
    revision_number VARCHAR(10)  NOT NULL,
    sheet_id        INT          NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (sheet_id, revision_number)
);

CREATE TABLE spool
(
    id          INT          NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE weld_list
(
    id          INT          NOT NULL AUTO_INCREMENT,
    internal_id VARCHAR(100) NOT NULL,
    spool_id    INT          NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE spool_rev
(
    id         INT       NOT NULL AUTO_INCREMENT,
    spool_id   INT       NOT NULL,
    rev_id     INT       NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (spool_id, rev_id),
    PRIMARY KEY (id)
);

CREATE TABLE joint
(
    id         INT       NOT NULL AUTO_INCREMENT,
    part1_id   INT       NOT NULL,
    part2_id   INT       NOT NULL,
    spool_id   INT       NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld
(
    id                 INT         NOT NULL AUTO_INCREMENT,
    number             VARCHAR(10) NOT NULL,
    joint_id           INT         NOT NULL,
    filler_material_id INT,
    wps_id             INT,
    created_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE part_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    part_id             INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    weld_id             INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE joint_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    joint_id            INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE cut_list_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    cut_list_id         INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE assembly_list_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    assembly_list_id    INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld_list_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    weld_list_id        INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_by_id       INT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE diameter
    ADD CONSTRAINT chk_nominal_mm_positive CHECK (nominal_mm > 0),
    ADD CONSTRAINT chk_nominal_inch_positive CHECK (nominal_inch > 0);

ALTER TABLE wps
    ADD CONSTRAINT chk_tpi_positive CHECK (tpi > 0);

ALTER TABLE user_role
    ADD FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE;

ALTER TABLE cut_list
    ADD FOREIGN KEY (isometric_id) REFERENCES isometric (id) ON DELETE CASCADE;

ALTER TABLE assembly_list
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

ALTER TABLE isometric
    ADD FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE;

ALTER TABLE sheet
    ADD FOREIGN KEY (isometric_id) REFERENCES isometric (id) ON DELETE CASCADE,
    ADD CONSTRAINT chk_sheet_number_positive CHECK (number > 0);

ALTER TABLE rev
    ADD FOREIGN KEY (sheet_id) REFERENCES sheet (id) ON DELETE CASCADE;

ALTER TABLE spool_rev
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (rev_id) REFERENCES rev (id) ON DELETE CASCADE;

ALTER TABLE weld_list
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE;

ALTER TABLE joint
    ADD FOREIGN KEY (part1_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (part2_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE,
    ADD CONSTRAINT chk_different_parts CHECK (part1_id != part2_id);

ALTER TABLE weld
    ADD FOREIGN KEY (filler_material_id) REFERENCES filler_material (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (wps_id) REFERENCES wps (id) ON DELETE SET NULL;

ALTER TABLE part_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (part_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

ALTER TABLE weld_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (weld_id) REFERENCES weld (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

ALTER TABLE joint_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

ALTER TABLE cut_list_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (cut_list_id) REFERENCES cut_list (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

ALTER TABLE assembly_list_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (assembly_list_id) REFERENCES assembly_list (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

ALTER TABLE weld_list_work_status
    ADD FOREIGN KEY (created_by_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (weld_list_id) REFERENCES weld_list (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id);

CREATE INDEX idx_user_role_user_id ON user_role (user_id);
CREATE INDEX idx_user_role_role_id ON user_role (role_id);
CREATE INDEX idx_diameter_nominal_inch ON diameter (nominal_inch);
CREATE INDEX idx_cut_list_isometric_id ON cut_list (isometric_id);
CREATE INDEX idx_assembly_list_isometric_id ON assembly_list (isometric_id);
CREATE INDEX idx_part_type ON part (type);
CREATE INDEX idx_part_number ON part (number);
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
CREATE INDEX idx_sheet_number ON sheet (number);
CREATE INDEX idx_sheet_isometric_id ON sheet (isometric_id);
CREATE INDEX idx_rev_revision_number ON rev (revision_number);
CREATE INDEX idx_rev_sheet_id ON rev (sheet_id);
CREATE INDEX idx_spool_rev_spool_id ON spool_rev (spool_id);
CREATE INDEX idx_spool_rev_rev_id ON spool_rev (rev_id);
CREATE INDEX idx_weld_list_spool_id ON weld_list (spool_id);
CREATE INDEX idx_joint_part1_id ON joint (part1_id);
CREATE INDEX idx_joint_part2_id ON joint (part2_id);
CREATE INDEX idx_joint_spool_id ON joint (spool_id);
CREATE INDEX idx_weld_joint_id ON weld (joint_id);
CREATE INDEX idx_weld_filler_material_id ON weld (filler_material_id);
CREATE INDEX idx_weld_wps_id ON weld (wps_id);
CREATE INDEX idx_part_work_status_part_id ON part_work_status (part_id);
CREATE INDEX idx_part_work_status_work_status_type_id ON part_work_status (work_status_type_id);
CREATE INDEX idx_part_work_status_created_by ON part_work_status (created_by_id);
CREATE INDEX idx_weld_work_status_weld_id ON weld_work_status (weld_id);
CREATE INDEX idx_weld_work_status_work_status_type_id ON weld_work_status (work_status_type_id);
CREATE INDEX idx_weld_work_status_created_by ON weld_work_status (created_by_id);
CREATE INDEX idx_joint_work_status_joint_id ON joint_work_status (joint_id);
CREATE INDEX idx_joint_work_status_work_status_type_id ON joint_work_status (work_status_type_id);
CREATE INDEX idx_joint_work_status_created_by ON joint_work_status (created_by_id);
CREATE INDEX idx_cut_list_work_status_cut_list_id ON cut_list_work_status (cut_list_id);
CREATE INDEX idx_cut_list_work_status_work_status_type_id ON cut_list_work_status (work_status_type_id);
CREATE INDEX idx_cut_list_work_status_created_by ON cut_list_work_status (created_by_id);
CREATE INDEX idx_assembly_list_work_status_assembly_list_id ON assembly_list_work_status (assembly_list_id);
CREATE INDEX idx_assembly_list_work_status_work_status_type_id ON assembly_list_work_status (work_status_type_id);
CREATE INDEX idx_assembly_list_work_status_created_by ON assembly_list_work_status (created_by_id);
CREATE INDEX idx_weld_list_work_status_weld_list_id ON weld_list_work_status (weld_list_id);
CREATE INDEX idx_weld_list_work_status_work_status_type_id ON weld_list_work_status (work_status_type_id);
CREATE INDEX idx_weld_list_work_status_created_by ON weld_list_work_status (created_by_id);
CREATE INDEX idx_part_work_status_composite ON part_work_status (part_id, work_status_type_id, created_at);
CREATE INDEX idx_weld_work_status_composite ON weld_work_status (weld_id, work_status_type_id, created_at);
CREATE INDEX idx_joint_work_status_composite ON joint_work_status (joint_id, work_status_type_id, created_at);
CREATE INDEX idx_cut_list_work_status_composite ON cut_list_work_status (cut_list_id, work_status_type_id, created_at);
CREATE INDEX idx_assembly_list_work_status_composite ON assembly_list_work_status (assembly_list_id, work_status_type_id, created_at);
CREATE INDEX idx_weld_list_work_status_composite ON weld_list_work_status (weld_list_id, work_status_type_id, created_at);
CREATE INDEX idx_spool_rev_composite ON spool_rev (spool_id, rev_id);
CREATE INDEX idx_user_role_composite ON user_role (user_id, role_id);