class User {
  final String name;
  final String username;
  final String password;

  User({required this.name, required this.username, required this.password});

  User.fromJson(Map<String, Object?> json)
      : this(
          name: json['name']! as String,
          username: json['username']! as String,
          password: json['password']! as String,
        );

  Map<String, Object?> toJson() {
    return {
      'name': name,
      'username': username,
      'password': password,
    };
  }
}
