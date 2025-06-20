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

CREATE TABLE cut_list
(
    id                  INT          NOT NULL AUTO_INCREMENT,
    internal_id         VARCHAR(100) NOT NULL,
    cutting_operator_id INT,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (internal_id),
    PRIMARY KEY (id)
);

CREATE TABLE part
(
    id         INT                             NOT NULL AUTO_INCREMENT,
    type       ENUM ('pipe_length', 'fitting') NOT NULL,
    number     VARCHAR(100)                    NOT NULL,
    created_at TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP                       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE pipe_length
(
    id                  INT           NOT NULL,
    internal_id         VARCHAR(100)  NOT NULL,
    description         VARCHAR(100)  NOT NULL,
    length              DECIMAL(8, 2) NOT NULL,
    thickness           DECIMAL(5, 2) NOT NULL,
    heat_number         VARCHAR(100),
    material_id         INT           NOT NULL,
    diameter_id         INT           NOT NULL,
    cutting_operator_id INT,
    cut_list_id         INT,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    id             INT       NOT NULL AUTO_INCREMENT,
    part1_id       INT       NOT NULL,
    part2_id       INT       NOT NULL,
    spool_id       INT       NOT NULL,
    pipe_fitter_id INT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE weld
(
    id                 INT       NOT NULL AUTO_INCREMENT,
    joint_id           INT       NOT NULL,
    filler_material_id INT,
    wps_id             INT,
    welder_id          INT,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE part_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    part_id             INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT,
    PRIMARY KEY (id)
);

CREATE TABLE weld_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    weld_id             INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT,
    PRIMARY KEY (id)
);

CREATE TABLE joint_work_status
(
    id                  INT       NOT NULL AUTO_INCREMENT,
    joint_id            INT       NOT NULL,
    work_status_type_id INT       NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          INT,
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
    ADD FOREIGN KEY (cutting_operator_id) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE pipe_length
    ADD FOREIGN KEY (id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (material_id) REFERENCES material (id),
    ADD FOREIGN KEY (diameter_id) REFERENCES diameter (id),
    ADD FOREIGN KEY (cutting_operator_id) REFERENCES user (id),
    ADD FOREIGN KEY (cut_list_id) REFERENCES cut_list (id) ON DELETE CASCADE,
    ADD CONSTRAINT chk_pipe_length_length_positive CHECK (length > 0),
    ADD CONSTRAINT chk_pipe_length_thickness_positive CHECK (thickness > 0);

ALTER TABLE fitting
    ADD FOREIGN KEY (id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (material_id) REFERENCES material (id),
    ADD FOREIGN KEY (fitting_type_id) REFERENCES fitting_type (id);

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

ALTER TABLE joint
    ADD FOREIGN KEY (part1_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (part2_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (spool_id) REFERENCES spool (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (pipe_fitter_id) REFERENCES user (id),
    ADD CONSTRAINT chk_different_parts CHECK (part1_id != part2_id);

ALTER TABLE weld
    ADD FOREIGN KEY (welder_id) REFERENCES user (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (filler_material_id) REFERENCES filler_material (id) ON DELETE SET NULL,
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (wps_id) REFERENCES wps (id) ON DELETE SET NULL;

ALTER TABLE part_work_status
    ADD FOREIGN KEY (part_id) REFERENCES part (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id),
    ADD FOREIGN KEY (created_by) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE weld_work_status
    ADD FOREIGN KEY (weld_id) REFERENCES weld (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id),
    ADD FOREIGN KEY (created_by) REFERENCES user (id) ON DELETE SET NULL;

ALTER TABLE joint_work_status
    ADD FOREIGN KEY (joint_id) REFERENCES joint (id) ON DELETE CASCADE,
    ADD FOREIGN KEY (work_status_type_id) REFERENCES work_status_type (id),
    ADD FOREIGN KEY (created_by) REFERENCES user (id) ON DELETE SET NULL;