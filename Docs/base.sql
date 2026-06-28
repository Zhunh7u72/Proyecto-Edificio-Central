-- ====================================================================
-- 1. CREACIÓN DE TIPOS ENUM
-- ====================================================================
CREATE TYPE rol_enum AS ENUM ('Estudiante', 'Administrador FEUE');
CREATE TYPE tipo_actividad_enum AS ENUM ('Anuncio', 'Evento', 'Capacitacion');
CREATE TYPE tipo_archivo_enum AS ENUM ('Fotografia', 'PDF');
CREATE TYPE tipo_contacto_enum AS ENUM ('telf', 'mail', 'whatsapp');
CREATE TYPE accion_auditoria_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');
-- ====================================================================
-- 2. GESTIÓN DE USUARIOS
-- ====================================================================
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    rol rol_enum NOT NULL
);
-- ====================================================================
-- 3. MÓDULO INTERACCIÓN Y ACTIVIDADES
-- ====================================================================
CREATE TABLE Actividades (
    id_actividad SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo tipo_actividad_enum NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite_inscripcion TIMESTAMP
);
CREATE TABLE Matriculas_Eventos (
    id_matricula SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    id_actividad INT REFERENCES Actividades(id_actividad) ON DELETE RESTRICT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_actividad INT REFERENCES Actividades(id_actividad) ON DELETE RESTRICT,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    contenido_texto TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ====================================================================
-- 4. GESTIÓN DE ARCHIVOS Y MULTIMEDIA
-- ====================================================================
CREATE TABLE Archivos_Actividades (
    id_archivo_activi SERIAL PRIMARY KEY,
    id_actividad INT REFERENCES Actividades(id_actividad) ON DELETE RESTRICT,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo tipo_archivo_enum NOT NULL
);
CREATE TABLE Archivos_Interaccion (
    id_archivo_inter SERIAL PRIMARY KEY,
    id_comentario INT REFERENCES Comentarios(id_comentario) ON DELETE RESTRICT,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_archivo tipo_archivo_enum NOT NULL
);
-- ====================================================================
-- 5. DIRECTORIO INSTITUCIONAL Y JERARQUÍA
-- ====================================================================
CREATE TABLE Facultades (
    id_facultad SERIAL PRIMARY KEY,
    nombre_facultad VARCHAR(150) NOT NULL
);
CREATE TABLE Facultades_Carreras (
    id_facultad_carrera SERIAL PRIMARY KEY,
    id_facultad INT REFERENCES Facultades(id_facultad) ON DELETE RESTRICT,
    nombre_carrera VARCHAR(150) NOT NULL
);
CREATE TABLE Fotos_Carreras (
    id_foto_carre SERIAL PRIMARY KEY,
    id_facultad_carrera INT REFERENCES Facultades_Carreras(id_facultad_carrera) ON DELETE RESTRICT,
    ruta_foto VARCHAR(500) NOT NULL
);
CREATE TABLE Contactos_Carreras (
    id_carreras_contac SERIAL PRIMARY KEY,
    id_facultad_carrera INT REFERENCES Facultades_Carreras(id_facultad_carrera) ON DELETE RESTRICT,
    contacto VARCHAR(150) NOT NULL,
    tipo_contacto tipo_contacto_enum NOT NULL
);
CREATE TABLE Informacion_Institucional (
    id_info_inst SERIAL PRIMARY KEY,
    mision TEXT NOT NULL,
    vision TEXT NOT NULL
);
CREATE TABLE Autoridades_Info_Institucional (
    id_autoridades_info_institu SERIAL PRIMARY KEY,
    id_info_inst INT REFERENCES Informacion_Institucional(id_info_inst) ON DELETE RESTRICT,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    ruta_foto TEXT NOT NULL,
    correo_contactos TEXT NOT NULL
);
-- ====================================================================
-- 6. SISTEMA DE PIISTAS DE AUDITORÍA
-- ====================================================================
CREATE TABLE Auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT,
    accion accion_auditoria_enum NOT NULL,
    tabla_afectada VARCHAR(100) NOT NULL,
    id_registro_afectado INT,
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    direccion_ip VARCHAR(45),
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);