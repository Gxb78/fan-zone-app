import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInUser, initializeUserStats } from "@/services/firebase"; // <-- On utilise nos nouveaux alias !
import type { User } from "../types"; // On importe notre type !

/**
 * Hook custom pour gérer l'état d'authentification de l'utilisateur.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged retourne une fonction "unsubscribe" pour le nettoyage
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // L'utilisateur est connecté, on met à jour notre état
        const formattedUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          creationTime: firebaseUser.metadata.creationTime,
        };
        setUser(formattedUser);
        initializeUserStats(firebaseUser.uid); // On s'assure que ses stats sont prêtes
      } else {
        // L'utilisateur n'est pas connecté, on lance la connexion anonyme
        // signInUser s'occupe de la logique de connexion ou de récupération de l'état
        signInUser(() => {});
        setUser(null);
      }
      setLoading(false);
    });

    // Nettoyage de l'écouteur quand le composant est démonté
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
