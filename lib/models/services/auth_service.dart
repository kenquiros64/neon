import 'package:flutter/widgets.dart';

import '../core/user.dart';

enum Status { Uninitialized, Authenticated, Authenticating, Unauthenticated }

class AuthService with ChangeNotifier {
  User _user;
  Status _status = Status.Uninitialized;

  AuthService() {}

  Status get status => _status;

  Future<User> getUser() {
    return Future.value(_user);
  }

  Future getUser() {
    return Future.value(_user);
  }

  Future logout() {
    this._user = null;
    notifyListeners();
    return Future.value(_user);
  }

  Future createUser(
      {String firstName,
      String lastName,
      String email,
      String password}) async {}

  Future loginUser({String username, String password}) {
    if (password == 'password123') {
      this.currentUser = {'email': email};
      notifyListeners();
      return Future.value(currentUser);
    } else {
      this.currentUser = null;
      return Future.value(null);
    }
  }
}
