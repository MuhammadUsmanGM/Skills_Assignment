# Framework-Specific API Patterns

## Node.js Frameworks

### Express.js
```javascript
// Route definition patterns
app.get('/users/:id', (req, res) => { ... });
app.post('/users', validateUser, (req, res) => { ... });
app.put('/users/:id', authenticate, authorize('admin'), (req, res) => { ... });

// Middleware patterns
app.use('/api', cors());
app.use(bodyParser.json());
app.use('/api/v1', rateLimit({windowMs: 15*60*1000, max: 100}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
```

### Fastify
```javascript
// Route definition patterns
fastify.get('/users/:id', {
  schema: {
    params: { type: 'object', properties: { id: { type: 'integer' } } },
    response: { 200: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } } }
  }
}, async (request, reply) => { ... });

// Plugin patterns
fastify.register(require('fastify-jwt'), { secret: 'supersecret' });
fastify.decorate('canAccess', (request, reply, done) => { ... });
```

## Python Frameworks

### Flask
```python
from flask import Flask, request, jsonify
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

# Route patterns
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify({'id': user_id, 'name': 'John'})

# Class-based views
class UserResource(Resource):
    def get(self, user_id):
        return {'id': user_id, 'name': 'John'}, 200

    def put(self, user_id):
        data = request.get_json()
        return {'id': user_id, 'name': data['name']}, 200

api.add_resource(UserResource, '/users/<int:user_id>')
```

### Django REST Framework
```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        # Custom action
        return Response({'status': 'password set'})
```

## Java Frameworks

### Spring Boot
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }
}

// With security annotations
@PreAuthorize("hasRole('ADMIN')")
@Secured("ROLE_ADMIN")
@RolesAllowed("ADMIN")
```

## C# Frameworks

### ASP.NET Core
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(User), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 404)]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    [ProducesResponseType(typeof(User), 201)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    public async Task<ActionResult<User>> CreateUser(CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
}
```

## Ruby Frameworks

### Ruby on Rails
```ruby
# Routes (config/routes.rb)
Rails.application.routes.draw do
  resources :users do
    member do
      patch :activate
    end
    collection do
      get :search
    end
  end

  # Custom routes
  get '/users/:id/profile', to: 'users#profile'
  post '/users/:id/follow', to: 'followings#create'
end

# Controller
class UsersController < ApplicationController
  before_action :authenticate_user!
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  def show
    @user = User.find(params[:id])
    render json: @user
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end

  def record_not_found
    render json: { error: 'Record not found' }, status: :not_found
  end
end
```

## PHP Frameworks

### Laravel
```php
// Routes (routes/api.php)
Route::apiResource('users', UserController::class);
Route::patch('/users/{user}/activate', [UserController::class, 'activate']);

// Controller
class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
        ]);

        $user = User::create($validated);
        return response()->json($user, 201);
    }
}
```

## Authentication Patterns

### JWT Authentication
```javascript
// Express.js with passport-jwt
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);
        if (user) return done(null, user);
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));
```

### API Key Authentication
```python
# Flask with custom decorator
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != os.environ.get('API_KEY'):
            abort(401, description="Invalid API key")
        return f(*args, **kwargs)
    return decorated_function

@app.route('/protected')
@require_api_key
def protected_route():
    return jsonify({'message': 'Access granted'})
```

## Validation Patterns

### Request Validation
```javascript
// Express.js with express-validator
const { body, validationResult } = require('express-validator');

app.post('/users', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('name').trim().isLength({ min: 1, max: 100 })
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
});
```

### Response Validation
```python
# Using Marshmallow for serialization
from marshmallow import Schema, fields, post_dump

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    created_at = fields.DateTime(dump_only=True)

    @post_dump
    def add_links(self, data, **kwargs):
        data['links'] = {
            'self': f'/users/{data["id"]}',
            'avatar': f'/users/{data["id"]}/avatar'
        }
        return data
```