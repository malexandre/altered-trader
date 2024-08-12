# AlteredTrader

Petite app toute simple pour faciliter la gestion de la collection (tradelist, wantlsit, etc.) et aussi des échanges directement.

## Bearer Token

L'app a besoin de votre Bearer Token pour s'authentitifer sur le site Altered. Pour le récupérer, ouvrez les outils développeurs sur votre navitageur, et dans l'onglet network, après avoir cliquer sur n'importe quel lien du site officiel, vous pourrez trouver le bearer token. Exemple (je cache mon bearer token en partie avec le carré rouge) :

![alt text](<Screenshot 2024-08-12 at 02.15.59.png>)

C'est un token qui doit être raffraichit de temps en temps, et il n'y a pour l'instant pas d'autres moyens que de le faire maneullement.

## Utilisation

### Collection

Après avoir chargé votre collection, toutes les versions d'une carte (KS, retail, autre) sont regroupées en une seule entrée. En bas à droite vous pouvez voir le nombre que vous possédez dans votre collection, et le nombre que vous avez en tradelist. Vous pouvez cliquer sur une carte pour affciher les détails et pour ajouter chaque version dans la wantlist ou dans la trade list.

### Wantlist

La page wantlist utilise la wantlist du site officiel pour trouver toutes les cartes dispo pour compléter vos playsets parmis les listes d'échange de vos amis. Vous pouvez démarrer un trade à partir de cette page, ça ne proposera que la quantité nécessaire pour compléter votre playset.

À noter que cette page n'affiche quelque chose que si la collection et les listes d'échange des amis ont été chargées.

### Échanges

Vous pouvez accepter ou refuser des échanges à partir de cette page, ou visualiser l'historique des échanges. La seule vraie différence avec le site officiel étant que je n'affiche pas les échanges annulés. Pour ajouter des cartes à un échange, pour l'instant il faut juste passer par l'onglet Amis, sélectionner les cartes que vous voulez échanger avec cette personne, et en cliquant sur démarrer un échange, ça les ajoutera à l'échange existante au lieu d'en créer une nouvelle (c'est le même comportement que le site officiel).

### Amis

Ici vous pouvez facilement naviguer les liste d'écahnges de vos amis et démarrer des trade, avec des filtres et sans être limité aux 36 premières cartes comme sur le site officiel. N'abusez pas du rechargement complet des listes d'échange, ça peut faire vraiment beacoup d'appels au serveur d'Altered. Si jamais vous avez une erreur lors du chargement, relancez le.

Vous pouvez aussi juste récupérer la liste d'amis sans leurs échanges, et quand vous ouvrez indiviudellement la page d'un amis, ça mettra la liste d'échange pour cet amis à jour.
