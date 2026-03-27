class ApiConstants {
  static const String baseUrl = 'https://trustrent.tommasolopiparo.com/api';
  
  // Auth endpoints
  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String profile = '$baseUrl/user/profile';
  
  // Properties endpoints
  static const String properties = '$baseUrl/properties';
  static const String myProperties = '$baseUrl/properties/my';
  
  // Messages endpoints
  static const String conversations = '$baseUrl/messages/conversations';
  static const String messages = '$baseUrl/messages/conversations';
  
  // Landlords endpoints
  static const String landlords = '$baseUrl/landlords';
  
  // Headers
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> getAuthHeaders(String token) => {
    ...headers,
    'Authorization': 'Bearer $token',
  };
}
