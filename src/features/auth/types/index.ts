// On définit une structure claire pour notre objet utilisateur.
// C'est la "carte d'identité" de nos données.
export interface User {
  uid: string;
  isAnonymous: boolean;
  creationTime?: string;
}
