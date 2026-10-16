-- 1. Crear el usuario
CREATE USER 'usuario_app'@'localhost'
IDENTIFIED BY 'UnaPasswordSegura_2026!';

-- 2. Otorgar permisos únicamente sobre una tabla específica
GRANT SELECT, INSERT, UPDATE, DELETE
ON mi_base_de_datos.mi_tabla
TO 'usuario_app'@'localhost';

-- 3. Verificar los permisos asignados
SHOW GRANTS FOR 'usuario_app'@'localhost';