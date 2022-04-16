import 'package:flutter/widgets.dart';

enum Status { Uninitialized, Authenticated, Authenticating, Unauthenticated }

class UserRepository with ChangeNotifier {
  Status _status = Status.Uninitialized;

  UserRepository.instance() {}

  Status get status => _status;

  //Future<bool> signIn(String email, String password) async {}

  //Future signOut() async {}

  //Future<void> _onAuthStateChanged() async {}
}
