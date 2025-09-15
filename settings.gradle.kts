pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MrComic"

include(":app")

// Core modules
include(":core:core-ui")
include(":core:core-data")
include(":core:core-domain")
include(":core:core-model")
include(":core:core-common")
include(":core:core-database")

// Feature modules
include(":feature:feature-auth")
include(":feature:feature-library")
include(":feature:feature-reader")
include(":feature:feature-ocr")
include(":feature:feature-settings")

// Data modules
include(":data:comic-formats")
include(":data:file-system")
include(":data:cloud-integration")