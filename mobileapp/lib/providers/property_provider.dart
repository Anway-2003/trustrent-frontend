import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class PropertyProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Property> _properties = [];
  List<Property> _myProperties = [];
  Property? _selectedProperty;
  bool _isLoading = false;
  String? _error;

  List<Property> get properties => _properties;
  List<Property> get myProperties => _myProperties;
  Property? get selectedProperty => _selectedProperty;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _properties = await _apiService.getProperties();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMyProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _myProperties = await _apiService.getMyProperties();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProperty(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedProperty = await _apiService.getProperty(id);
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearSelectedProperty() {
    _selectedProperty = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
