from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Task Model (Week 3)
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    priority = db.Column(db.String(20), default='medium')
    
    def __repr__(self):
        return f'<Task {self.id}>'

# Temporary in-memory storage for Week 2
tasks = []

# Update the routes to use database
@app.route('/')
def index():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return render_template('index.html', tasks=tasks)

@app.route('/add_task', methods=['POST'])
def add_task():
    task_content = request.form.get('content')
    priority = request.form.get('priority', 'medium')
    
    if task_content:
        new_task = Task(content=task_content, priority=priority)
        db.session.add(new_task)
        db.session.commit()
    
    return redirect(url_for('index'))

@app.route('/delete_task/<int:task_id>')
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/toggle_task/<int:task_id>')
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/api/tasks')
def api_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify([{
        'id': task.id,
        'content': task.content,
        'completed': task.completed,
        'priority': task.priority,
        'created_at': task.created_at.isoformat()
    } for task in tasks])

@app.route('/api/add_task', methods=['POST'])
def api_add_task():
    data = request.get_json()
    task_content = data.get('content')
    priority = data.get('priority', 'medium')
    
    if task_content:
        new_task = Task(content=task_content, priority=priority)
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'task': {
                'id': new_task.id,
                'content': new_task.content,
                'completed': new_task.completed,
                'priority': new_task.priority,
                'created_at': new_task.created_at.isoformat()
            }
        })
    
    return jsonify({'success': False})

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensure table creation
    app.run(debug=True)
