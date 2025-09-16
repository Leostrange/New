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
include(":core-model")
include(":core-ui")
include(":core-data")
include(":core-network")
include(":feature-library")
include(":feature-reader")
include(":feature-settings")
include(":feature-translations")
include(":feature-details")
include(":feature-editing")
include(":feature-plugins")
