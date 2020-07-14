import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { auth, googleProvider, firestore } from "../firebase";

import Page from "../components/Page";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Stack from "../components/Stack";
import LoadingPage from "../components/LoadingPage";

const SignInView: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  if (loading) {
    return <LoadingPage />;
  }

  const signInWithGoogle = () => {
    setLoading(true);

    auth
      .signInWithPopup(googleProvider)
      .then((userCredential) =>
        createUserIfNotExists(userCredential)
          .then(() => history.push("/"))
          .catch((error: Error) => setError(error))
      )
      .catch((error: Error) => {
        setError(error);
        setLoading(false);
      });
  };

  const createUserIfNotExists = (
    userCredential: firebase.auth.UserCredential
  ) => {
    return new Promise((resolve, reject) => {
      const usersRef = firestore
        .collection("users")
        .doc(userCredential.user?.uid);

      usersRef
        .get()
        .then((docSnapshot) => {
          if (!docSnapshot.exists) {
            usersRef
              .set({})
              .then(() => {
                resolve();
              })
              .catch((error: Error) => reject(error));
          }
        })
        .catch((error: Error) => reject(error));

      resolve();
    });
  };

  return (
    <Page title="Sign in">
      <Stack>
        <Button variant="primary" onClick={signInWithGoogle}>
          Sign in with Google
        </Button>
      </Stack>
      {error && (
        <Alert variant="error" title="Error">
          {error.message}
        </Alert>
      )}
    </Page>
  );
};

export default SignInView;
