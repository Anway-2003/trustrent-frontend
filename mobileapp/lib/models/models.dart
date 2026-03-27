import '../utils/logger.dart';

class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? phone;
  final String? avatar;
  final String? bio;
  final bool verified;
  final String? city;
  final String? region;
  final String? country;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.phone,
    this.avatar,
    this.bio,
    required this.verified,
    this.city,
    this.region,
    this.country,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    try {
      AppLogger.debug('Creating User from JSON: $json');
      AppLogger.verbose('firstName field: "${json['firstName']}"');
      AppLogger.verbose('lastName field: "${json['lastName']}"');
      
      final user = User(
        id: json['id']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        firstName: json['firstName']?.toString() ?? '',
        lastName: json['lastName']?.toString() ?? '',
        role: json['role']?.toString() ?? 'tenant',
        phone: json['phone']?.toString(),
        avatar: json['avatar']?.toString(),
        bio: json['bio']?.toString(),
        verified: json['verified'] ?? false,
        city: json['city']?.toString(),
        region: json['region']?.toString(),
        country: json['country']?.toString(),
        createdAt: json['createdAt'] != null 
            ? DateTime.parse(json['createdAt'])
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null 
            ? DateTime.parse(json['updatedAt'])
            : DateTime.now(),
      );
      
      AppLogger.debug('Created User - firstName: "${user.firstName}", lastName: "${user.lastName}"');
      return user;
    } catch (e, stackTrace) {
      AppLogger.error('Error creating User from JSON', e, stackTrace);
      AppLogger.debug('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'role': role,
      'phone': phone,
      'avatar': avatar,
      'bio': bio,
      'verified': verified,
      'city': city,
      'region': region,
      'country': country,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Property {
  final String id;
  final String title;
  final String description;
  final double price;
  final String location;
  final String type;
  final int bedrooms;
  final int bathrooms;
  final double area;
  final List<String> images;
  final List<String> amenities;
  final String landlordId;
  final User? landlord;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  // Additional fields from database
  final bool furnished;
  final bool hasParking;
  final bool hasBalcony;
  final bool hasGarden;
  final bool petsAllowed;
  final bool smokingAllowed;
  final String? address;
  final String? city;
  final String? region;
  final String? country;
  final int? floor;
  final bool? hasElevator;
  final double? deposit;
  final double? utilities;
  final bool available;

  Property({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.location,
    required this.type,
    required this.bedrooms,
    required this.bathrooms,
    required this.area,
    required this.images,
    required this.amenities,
    required this.landlordId,
    this.landlord,
    required this.createdAt,
    this.updatedAt,
    this.furnished = false,
    this.hasParking = false,
    this.hasBalcony = false,
    this.hasGarden = false,
    this.petsAllowed = false,
    this.smokingAllowed = false,
    this.address,
    this.city,
    this.region,
    this.country,
    this.floor,
    this.hasElevator,
    this.deposit,
    this.utilities,
    this.available = true,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    try {
      AppLogger.debug('Creating Property from JSON: $json');
      
      return Property(
        id: (json['id'] ?? '').toString(),
        title: json['title']?.toString() ?? '',
        description: json['description']?.toString() ?? '',
        price: (json['monthlyRent'] ?? json['price'] ?? 0).toDouble(), // Use monthlyRent from DB, fallback to price
        location: json['city'] != null && json['region'] != null 
            ? '${json['city']}, ${json['region']}' 
            : (json['location']?.toString() ?? json['address']?.toString() ?? 'Location not specified'), // Combine city/region or use location/address
        type: json['type']?.toString() ?? 'APARTMENT',
        bedrooms: json['rooms'] ?? json['bedrooms'] ?? 0, // Use rooms from DB, fallback to bedrooms
        bathrooms: json['bathrooms'] ?? 0,
        area: (json['area'] ?? 0).toDouble(),
        images: List<String>.from(json['images'] ?? []),
        amenities: List<String>.from(json['amenities'] ?? []),
        landlordId: (json['ownerId'] ?? json['landlordId'] ?? '').toString(), // Use ownerId from DB
        landlord: json['owner'] != null 
            ? User.fromJson(json['owner'])
            : (json['landlord'] != null ? User.fromJson(json['landlord']) : null),
        createdAt: json['createdAt'] != null 
            ? DateTime.parse(json['createdAt'])
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null 
            ? DateTime.parse(json['updatedAt'])
            : null,
        // Additional fields from database
        furnished: json['furnished'] ?? false,
        hasParking: json['hasParking'] ?? false,
        hasBalcony: json['hasBalcony'] ?? false,
        hasGarden: json['hasGarden'] ?? false,
        petsAllowed: json['petsAllowed'] ?? false,
        smokingAllowed: json['smokingAllowed'] ?? false,
        address: json['address']?.toString(),
        city: json['city']?.toString(),
        region: json['region']?.toString(),
        country: json['country']?.toString(),
        floor: json['floor'],
        hasElevator: json['hasElevator'],
        deposit: json['deposit']?.toDouble(),
        utilities: json['utilities']?.toDouble(),
        available: json['available'] ?? true,
      );
    } catch (e, stackTrace) {
      AppLogger.error('Error creating Property from JSON', e, stackTrace);
      AppLogger.debug('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'price': price,
      'location': location,
      'type': type,
      'bedrooms': bedrooms,
      'bathrooms': bathrooms,
      'area': area,
      'images': images,
      'amenities': amenities,
      'landlordId': landlordId,
      'landlord': landlord?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

class Conversation {
  final String id;
  final String? user1Id;
  final String? user2Id;
  final String? lastMessageId;
  final DateTime? lastMessageAt;
  final String? propertyId;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  // Derived/related objects (from API joins)
  final User? user1;
  final User? user2;
  final User? otherUser; // Direct from conversations API
  final Message? lastMessage;
  final Property? property;
  final int? unreadCount;

  Conversation({
    required this.id,
    this.user1Id,
    this.user2Id,
    this.lastMessageId,
    this.lastMessageAt,
    this.propertyId,
    required this.createdAt,
    this.updatedAt,
    this.user1,
    this.user2,
    this.otherUser,
    this.lastMessage,
    this.property,
    this.unreadCount,
  });

  // Get the other participant (not the current user)
  User? getOtherUser(String currentUserId) {
    // If we have otherUser directly (from conversations API), use it
    if (otherUser != null) {
      return otherUser;
    }
    
    // Standard logic for when we have both user1 and user2
    if (user1Id == currentUserId) return user2;
    if (user2Id == currentUserId) return user1;
    
    // Fallback: return whichever user we have that's not the current user
    if (user1 != null && user1!.id != currentUserId) return user1;
    if (user2 != null && user2!.id != currentUserId) return user2;
    
    return null;
  }

  // Helper to get participants list for backward compatibility
  List<User> get participants {
    final List<User> list = [];
    if (otherUser != null) {
      list.add(otherUser!);
    } else {
      if (user1 != null) list.add(user1!);
      if (user2 != null) list.add(user2!);
    }
    return list;
  }

  factory Conversation.fromJson(Map<String, dynamic> json) {
    try {
      AppLogger.debug('Creating Conversation from JSON: $json');
      
      return Conversation(
        id: (json['id'] ?? '').toString(),
        user1Id: json['user1Id']?.toString(),
        user2Id: json['user2Id']?.toString(),
        lastMessageId: json['lastMessageId']?.toString(),
        lastMessageAt: json['lastMessageAt'] != null
            ? DateTime.parse(json['lastMessageAt'])
            : null,
        propertyId: json['propertyId']?.toString(),
        createdAt: json['createdAt'] != null 
            ? DateTime.parse(json['createdAt'])
            : DateTime.now(),
        updatedAt: json['updatedAt'] != null 
            ? DateTime.parse(json['updatedAt'])
            : null,
        // Handle both API response formats
        user1: json['user1'] != null ? User.fromJson(json['user1']) : null,
        user2: json['user2'] != null ? User.fromJson(json['user2']) : null,
        otherUser: json['otherUser'] != null ? User.fromJson(json['otherUser']) : null,
        lastMessage: json['lastMessage'] != null 
            ? Message.fromJson(json['lastMessage'])
            : null,
        property: json['property'] != null 
            ? Property.fromJson(json['property'])
            : null,
        unreadCount: json['unreadCount'] ?? json['_count']?['messages'] ?? 0,
      );
    } catch (e, stackTrace) {
      AppLogger.error('Error creating Conversation from JSON', e, stackTrace);
      AppLogger.debug('JSON data: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user1Id': user1Id,
      'user2Id': user2Id,
      'lastMessageId': lastMessageId,
      'lastMessageAt': lastMessageAt?.toIso8601String(),
      'propertyId': propertyId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String receiverId;
  final String content;
  final String status; // 'SENT', 'DELIVERED', 'READ'
  final DateTime createdAt;
  final DateTime updatedAt;
  final User? sender;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.receiverId,
    required this.content,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.sender,
  });

  // Helper getters for backward compatibility
  DateTime get timestamp => createdAt;
  bool get isRead => status == 'READ' || status == 'READ'.toUpperCase();

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'].toString(),
      conversationId: json['conversationId'].toString(),
      senderId: json['senderId'].toString(),
      receiverId: json['receiverId'].toString(),
      content: json['content'],
      status: json['status'] ?? 'SENT',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      sender: json['sender'] != null 
          ? User.fromJson(json['sender'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversationId': conversationId,
      'senderId': senderId,
      'receiverId': receiverId,
      'content': content,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'sender': sender?.toJson(),
    };
  }
}
