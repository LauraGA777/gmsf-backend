import sequelize from '../config/db';

async function cleanDatabase() {
    try {
        console.log('🧹 Iniciando limpieza completa de la base de datos...');

        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Sincronizar con force: true para eliminar todas las tablas y recrearlas
        await sequelize.sync({ force: true });
        console.log('✅ Todas las tablas eliminadas y recreadas');

        console.log('🎉 ¡Base de datos limpiada exitosamente!');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        throw error;
    }
}

// Ejecutar el script
if (require.main === module) {
    cleanDatabase()
        .then(() => {
            console.log('\n✅ Limpieza completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error en la limpieza:', error);
            process.exit(1);
        });
}

export default cleanDatabase;
