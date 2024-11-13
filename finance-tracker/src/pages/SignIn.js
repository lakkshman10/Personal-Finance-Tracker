import React from 'react';

function SignIn() {
  return (
    <div>
      <h2>Sign In</h2>
      <form>
        <label>Email:</label>
        <input type="email" name="email" required />
        <br />
        <label>Password:</label>
        <input type="password" name="password" required />
        <br />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;
