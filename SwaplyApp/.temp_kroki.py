import zlib
import base64
import urllib.request
import os

observer_code = """classDiagram
    class IMatchObserver {
        <<interface>>
        +onMatchFound(matchData) void
        +onMessageReceived(msg) void
    }

    class MatchNotificationService {
        -observers : Array
        -firestoreRef : Object
        +subscribe(obs: IMatchObserver) void
        +unsubscribe(obs: IMatchObserver) void
        +notifyAll(event) void
        +listenToMatches(uid) void
    }

    class ChatScreenObserver {
        +onMatchFound(data) void
        +onMessageReceived(msg) void
    }

    class MapScreenObserver {
        +onMatchFound(data) void
        +onMessageReceived(msg) void
    }

    MatchNotificationService o-- IMatchObserver : "notifies"
    IMatchObserver <|.. ChatScreenObserver : "implements via JS"
    IMatchObserver <|.. MapScreenObserver : "implements via JS"
"""

repository_code = """classDiagram
    class IUserRepository {
        <<interface>>
        +getUserById(uid) User
        +updateUser(uid, data) void
        +deleteUser(uid) void
        +findMatches(uid) Array
        +submitRating(uid, rating) void
    }

    class FirestoreUserRepository {
        -db : FirebaseFirestore
        -usersCol : CollectionRef
        +getUserById(uid) User
        +updateUser(uid, data) void
        +deleteUser(uid) void
        +findMatches(uid) Array
        +submitRating(uid, rating) void
    }

    IUserRepository <|.. FirestoreUserRepository : "implements contract"
"""

def download_mermaid(code, filename):
    compressed = zlib.compress(code.encode('utf-8'))
    b64 = base64.urlsafe_b64encode(compressed).decode('ascii')
    url = f"https://kroki.io/mermaid/svg/{b64}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        with open(filename, 'wb') as out_file:
            out_file.write(response.read())

if not os.path.exists('designs'):
    os.makedirs('designs')

download_mermaid(observer_code, 'designs/observer_uml.svg')
download_mermaid(repository_code, 'designs/repository_uml.svg')
print("Downloaded SVGs successfully!")
