-- Tabla de cupones de descuento de la landing (2026-07-23).
-- Aditiva: no toca ninguna tabla compartida con parkingplus.
-- Aplicar con:
--   npx prisma db execute --file prisma/sql/2026-07-23-cupones.sql --schema prisma/schema.prisma
CREATE TABLE IF NOT EXISTS `cupones` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `codigo`       VARCHAR(50)   NOT NULL,
  `tipo`         VARCHAR(10)   NOT NULL DEFAULT 'porcentaje',
  `valor`        DECIMAL(10,2) NOT NULL,
  `valido_desde` DATETIME      NULL,
  `valido_hasta` DATETIME      NULL,
  `max_usos`     INT           NULL,
  `usos`         INT           NOT NULL DEFAULT 0,
  `activo`       TINYINT(1)    NOT NULL DEFAULT 1,
  `campana`      VARCHAR(100)  NULL,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cupones_codigo_key` (`codigo`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
