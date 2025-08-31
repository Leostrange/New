package com.example.core.data.database

import androidx.room.AutoMigration
import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.core.data.database.plugins.PluginDao
import com.example.core.data.database.plugins.PluginEntity
import com.example.core.data.reader.ReaderStateEntity
import com.example.core.data.reader.ReaderStateDao

@Database(
    entities = [ComicEntity::class, BookmarkEntity::class, NoteEntity::class, PluginEntity::class, ReaderStateEntity::class],
    version = 6,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun comicDao(): ComicDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun noteDao(): NoteDao
    abstract fun pluginDao(): PluginDao
    abstract fun readerStateDao(): ReaderStateDao

    companion object {
        /**
         * Migration from version 1 to version 2
         * Added bookmarks table
         */
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `bookmarks` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `comicId` TEXT NOT NULL,
                        `page` INTEGER NOT NULL,
                        `label` TEXT,
                        `timestamp` INTEGER NOT NULL,
                        FOREIGN KEY(`comicId`) REFERENCES `comics`(`filePath`) ON UPDATE NO ACTION ON DELETE CASCADE
                    )
                    """.trimIndent()
                )
                database.execSQL("CREATE INDEX IF NOT EXISTS `index_bookmarks_comicId` ON `bookmarks` (`comicId`)")
            }
        }

        /**
         * Migration from version 2 to version 3
         * Added plugins table
         */
        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `plugins` (
                        `id` TEXT PRIMARY KEY NOT NULL,
                        `name` TEXT NOT NULL,
                        `version` TEXT NOT NULL,
                        `author` TEXT NOT NULL,
                        `description` TEXT NOT NULL,
                        `category` TEXT NOT NULL,
                        `type` TEXT NOT NULL,
                        `permissions` TEXT NOT NULL,
                        `dependencies` TEXT NOT NULL,
                        `isEnabled` INTEGER NOT NULL,
                        `isInstalled` INTEGER NOT NULL,
                        `configurable` INTEGER NOT NULL,
                        `iconUrl` TEXT,
                        `sourceUrl` TEXT,
                        `packagePath` TEXT,
                        `metadata` TEXT NOT NULL,
                        `installDate` INTEGER NOT NULL,
                        `lastUpdateDate` INTEGER NOT NULL
                    )
                    """.trimIndent()
                )
            }
        }

        /**
         * Migration from version 3 to version 4
         * Added reader_state table
         */
        val MIGRATION_3_4 = object : Migration(3, 4) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `reader_state` (
                        `id` INTEGER PRIMARY KEY NOT NULL,
                        `comicTitle` TEXT NOT NULL,
                        `page` INTEGER NOT NULL
                    )
                    """.trimIndent()
                )
            }
        }

        /**
         * Migration from version 4 to version 5
         * Updated ComicEntity structure - removed auto-increment id, made filePath primary key
         */
        val MIGRATION_4_5 = object : Migration(4, 5) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Create new comics table with updated structure
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `comics_new` (
                        `filePath` TEXT PRIMARY KEY NOT NULL,
                        `title` TEXT NOT NULL,
                        `coverPath` TEXT,
                        `dateAdded` INTEGER NOT NULL,
                        `currentPage` INTEGER NOT NULL DEFAULT 0
                    )
                    """.trimIndent()
                )

                // Copy data from old table to new table (mapping old schema to new)
                database.execSQL(
                    """
                    INSERT INTO `comics_new` (`filePath`, `title`, `coverPath`, `dateAdded`, `currentPage`)
                    SELECT `filePath`, `title`, `coverPath`, 
                           COALESCE(`addedDate`, strftime('%s', 'now') * 1000),
                           COALESCE(`progress`, 0)
                    FROM `comics`
                    """.trimIndent()
                )

                // Drop old table
                database.execSQL("DROP TABLE `comics`")

                // Rename new table
                database.execSQL("ALTER TABLE `comics_new` RENAME TO `comics`")

                // Update bookmarks table foreign key reference
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `bookmarks_new` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `comicId` TEXT NOT NULL,
                        `page` INTEGER NOT NULL,
                        `label` TEXT,
                        `timestamp` INTEGER NOT NULL,
                        FOREIGN KEY(`comicId`) REFERENCES `comics`(`filePath`) ON UPDATE NO ACTION ON DELETE CASCADE
                    )
                    """.trimIndent()
                )

                database.execSQL(
                    """
                    INSERT INTO `bookmarks_new` SELECT * FROM `bookmarks`
                    """.trimIndent()
                )

                database.execSQL("DROP TABLE `bookmarks`")
                database.execSQL("ALTER TABLE `bookmarks_new` RENAME TO `bookmarks`")
                database.execSQL("CREATE INDEX IF NOT EXISTS `index_bookmarks_comicId` ON `bookmarks` (`comicId`)")
            }
        }

        /**
         * Migration from version 5 to version 6
         * Added notes table
         */
        val MIGRATION_5_6 = object : Migration(5, 6) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `notes` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `comicId` TEXT NOT NULL,
                        `page` INTEGER NOT NULL,
                        `content` TEXT NOT NULL,
                        `title` TEXT,
                        `positionX` REAL,
                        `positionY` REAL,
                        `timestamp` INTEGER NOT NULL,
                        `lastModified` INTEGER NOT NULL,
                        FOREIGN KEY(`comicId`) REFERENCES `comics`(`filePath`) ON UPDATE NO ACTION ON DELETE CASCADE
                    )
                    """.trimIndent()
                )
                database.execSQL("CREATE INDEX IF NOT EXISTS `index_notes_comicId` ON `notes` (`comicId`)")
                database.execSQL("CREATE INDEX IF NOT EXISTS `index_notes_page` ON `notes` (`page`)")
            }
        }

        /**
         * Get all migrations for the database
         */
        fun getAllMigrations(): Array<Migration> {
            return arrayOf(
                MIGRATION_1_2,
                MIGRATION_2_3,
                MIGRATION_3_4,
                MIGRATION_4_5,
                MIGRATION_5_6
            )
        }
    }
}