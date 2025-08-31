// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.hilt.android) apply false
    alias(libs.plugins.detekt)
}

subprojects {
    apply(plugin = "io.gitlab.arturbosch.detekt")
    
    detekt {
        config.setFrom(rootProject.file("detekt.yml"))
        buildUponDefaultConfig = true
    }
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}

tasks.register("projectStructure") {
    doLast {
        println("========================================")
        println("MR.COMIC PROJECT STRUCTURE")
        println("========================================")
        println("│")
        println("├── android/")
        println("│   ├── app/                 (Main application module)")
        println("│   ├── core-analytics/      (Analytics and crash reporting)")
        println("│   ├── core-data/           (Data layer with repositories)")
        println("│   ├── core-domain/         (Business logic and use cases)")
        println("│   ├── core-model/          (Data models and entities)")
        println("│   ├── core-reader/         (Core reading functionality)")
        println("│   ├── core-ui/             (UI components and theming)")
        println("│   ├── feature-analytics/   (Analytics UI screens)")
        println("│   ├── feature-library/     (Library management)")
        println("│   ├── feature-ocr/         (OCR and translation)")
        println("│   ├── feature-onboarding/  (Onboarding flow)")
        println("│   ├── feature-plugins/     (Plugin system)")
        println("│   ├── feature-reader/      (Reading experience)")
        println("│   ├── feature-settings/    (Settings and preferences)")
        println("│   └── feature-themes/      (Theme management)")
        println("│")
        println("├── dictionaries/            (Translation dictionaries)")
        println("├── docs/                   (Documentation)")
        println("├── example-plugins/        (Sample plugins)")
        println("├── local_resources/        (Local resources)")
        println("├── media/                  (Media files)")
        println("├── plugins/                (Plugin files)")
        println("└── reports/                (Generated reports)")
        println()
        println("Total modules: ${getSubprojects().size}")
    }
}