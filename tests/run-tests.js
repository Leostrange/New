/**
 * Запуск тестов системы Mr.Comic
 * 
 * Этот файл запускает тесты для проверки функциональности компонентов,
 * разработанных в рамках проекта Mr.Comic.
 */

// Импорт тестов
const { runTests: runPluginSystemTests } = require('./plugin-system-tests');
const { runTests: runImageEditorToolTests } = require('./ImageEditorToolTest');
const { runTests: runExceptionManagerTests } = require('./ExceptionManagerTest');
const { runTests: runResourceAuditTests } = require('./ResourceAuditTest');

// Запуск тестов и вывод результатов
async function main() {
  console.log('Запуск тестов системы Mr.Comic...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  // Запуск тестов системы плагинов
  console.log('\n=== Тесты системы плагинов ===');
  const pluginResults = await runPluginSystemTests();
  mergeResults(results, pluginResults);
  
  // Запуск тестов редактора изображений
  console.log('\n=== Тесты редактора изображений ===');
  const imageEditorResults = await runImageEditorToolTests();
  mergeResults(results, imageEditorResults);
  
  // Запуск тестов системы обработки исключений
  console.log('\n=== Тесты системы обработки исключений ===');
  const exceptionManagerResults = await runExceptionManagerTests();
  mergeResults(results, exceptionManagerResults);
  
  // Запуск тестов аудита ресурсов
  console.log('\n=== Тесты аудита ресурсов ===');
  const resourceAuditResults = await runResourceAuditTests();
  mergeResults(results, resourceAuditResults);
  
  console.log('\n=== Итоговый отчет ===');
  console.log(`Всего тестов: ${results.total}`);
  console.log(`Пройдено: ${results.passed}`);
  console.log(`Не пройдено: ${results.failed}`);
  console.log(`Пропущено: ${results.skipped}`);
  
  if (results.failed > 0) {
    console.log('\nНе пройденные тесты:');
    results.details
      .filter(detail => detail.status === 'failed')
      .forEach(detail => {
        console.log(`- ${detail.name}: ${detail.error}`);
      });
  }
  
  return results;
}

/**
 * Объединение результатов тестов
 * @param {Object} target - Целевой объект результатов
 * @param {Object} source - Исходный объект результатов
 */
function mergeResults(target, source) {
  target.total += source.total;
  target.passed += source.passed;
  target.failed += source.failed;
  target.skipped += source.skipped;
  
  if (source.details && Array.isArray(source.details)) {
    target.details = target.details.concat(source.details);
  }
}

// Запуск тестов
main().catch(error => {
  console.error('Ошибка при запуске тестов:', error);
  process.exit(1);
});
