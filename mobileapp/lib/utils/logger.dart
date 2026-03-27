import 'package:logger/logger.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

/// File output for logger that saves logs to device storage
class FileOutput extends LogOutput {
  late File _file;
  bool _initialized = false;

  @override
  Future<void> init() async {
    super.init();
    await _initFile();
  }

  Future<void> _initFile() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logsDir = Directory('${directory.path}/logs');
      if (!await logsDir.exists()) {
        await logsDir.create(recursive: true);
      }
      
      final now = DateTime.now();
      final dateStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      _file = File('${logsDir.path}/trustrent_$dateStr.log');
      _initialized = true;
    } catch (e) {
      print('Failed to initialize log file: $e');
    }
  }

  @override
  void output(OutputEvent event) {
    if (!_initialized) return;
    
    try {
      final lines = event.lines.join('\n');
      _file.writeAsStringSync('$lines\n', mode: FileMode.append);
    } catch (e) {
      // Fallback to console if file write fails
      print('Log file write failed: $e');
      for (final line in event.lines) {
        print(line);
      }
    }
  }
}

/// Multi-output that logs to both console and file
class MultiOutput extends LogOutput {
  final List<LogOutput> outputs;
  
  MultiOutput(this.outputs);

  @override
  Future<void> init() async {
    super.init();
    for (final output in outputs) {
      await output.init();
    }
  }

  @override
  void output(OutputEvent event) {
    for (final output in outputs) {
      output.output(event);
    }
  }

  @override
  Future<void> destroy() async {
    for (final output in outputs) {
      await output.destroy();
    }
    super.destroy();
  }
}

/// Centralized logging configuration for the TrustRent app
class AppLogger {
  static late Logger _logger;
  static bool _initialized = false;

  /// Initialize the logger with custom configuration
  static Future<void> initialize({
    bool isDebugMode = true, 
    bool saveToFile = false,
  }) async {
    if (_initialized) return;

    // Choose output based on configuration
    LogOutput output;
    if (saveToFile) {
      // Log to both console and file
      output = MultiOutput([
        ConsoleOutput(),
        FileOutput(),
      ]);
    } else {
      // Log only to console (default)
      output = ConsoleOutput();
    }

    _logger = Logger(
      filter: isDebugMode ? DevelopmentFilter() : ProductionFilter(),
      printer: PrettyPrinter(
        methodCount: 2, // number of method calls to be displayed
        errorMethodCount: 8, // number of method calls if stacktrace is provided
        lineLength: 120, // width of the output
        colors: true, // colorful log messages
        printEmojis: true, // print an emoji for each log message
        dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart, // show time and elapsed since start
      ),
      output: output,
    );

    _initialized = true;
  }

  /// Get the configured logger instance
  static Logger get instance {
    if (!_initialized) {
      // Initialize with default settings if not already done
      initialize();
    }
    return _logger;
  }

  // Convenience methods for different log levels
  static void verbose(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.t(message, error: error, stackTrace: stackTrace);
  }

  static void debug(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.d(message, error: error, stackTrace: stackTrace);
  }

  static void info(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.i(message, error: error, stackTrace: stackTrace);
  }

  static void warning(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.w(message, error: error, stackTrace: stackTrace);
  }

  static void error(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.e(message, error: error, stackTrace: stackTrace);
  }

  static void fatal(dynamic message, [dynamic error, StackTrace? stackTrace]) {
    instance.f(message, error: error, stackTrace: stackTrace);
  }

  /// Get log files directory for accessing saved logs
  static Future<Directory?> getLogsDirectory() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logsDir = Directory('${directory.path}/logs');
      if (await logsDir.exists()) {
        return logsDir;
      }
    } catch (e) {
      error('Failed to get logs directory', e);
    }
    return null;
  }

  /// Get list of all log files
  static Future<List<File>> getLogFiles() async {
    try {
      final logsDir = await getLogsDirectory();
      if (logsDir != null) {
        return logsDir
            .listSync()
            .whereType<File>()
            .where((file) => file.path.endsWith('.log'))
            .toList();
      }
    } catch (e) {
      error('Failed to get log files', e);
    }
    return [];
  }

  /// Clear old log files (keep only last N days)
  static Future<void> clearOldLogs({int keepDays = 7}) async {
    try {
      final logFiles = await getLogFiles();
      final cutoffDate = DateTime.now().subtract(Duration(days: keepDays));
      
      for (final file in logFiles) {
        final stat = await file.stat();
        if (stat.modified.isBefore(cutoffDate)) {
          await file.delete();
          info('Deleted old log file: ${file.path}');
        }
      }
    } catch (e) {
      error('Failed to clear old logs', e);
    }
  }
}

/// Auth-specific logger with consistent prefixes
class AuthLogger {
  static void session(String message) {
    AppLogger.info('🔐 AUTH: $message');
  }

  static void storage(String message) {
    AppLogger.debug('💾 STORAGE: $message');
  }

  static void api(String message) {
    AppLogger.debug('🌐 API: $message');
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    AppLogger.error('❌ AUTH ERROR: $message', error, stackTrace);
  }

  static void warning(String message) {
    AppLogger.warning('⚠️ AUTH WARNING: $message');
  }

  static void success(String message) {
    AppLogger.info('✅ AUTH SUCCESS: $message');
  }
}

/// API-specific logger
class ApiLogger {
  static void request(String method, String url, {Map<String, String>? headers}) {
    AppLogger.debug('📤 $method $url');
    if (headers != null && headers.isNotEmpty) {
      AppLogger.verbose('📤 Headers: $headers');
    }
  }

  static void response(int statusCode, String url, {String? body}) {
    final emoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
    AppLogger.debug('📥 $emoji Response [$statusCode] $url');
    if (body != null && body.isNotEmpty) {
      AppLogger.verbose('📥 Response body: $body');
    }
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    AppLogger.error('🌐 API ERROR: $message', error, stackTrace);
  }
}

/// Navigation-specific logger
class NavLogger {
  static void route(String from, String to) {
    AppLogger.info('🎯 Navigation: $from → $to');
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    AppLogger.error('🎯 NAV ERROR: $message', error, stackTrace);
  }
}

/// UI-specific logger
class UiLogger {
  static void state(String widget, String state) {
    AppLogger.debug('🎨 UI: $widget - $state');
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    AppLogger.error('🎨 UI ERROR: $message', error, stackTrace);
  }
}
