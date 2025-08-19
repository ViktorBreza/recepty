from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app import models, schemas

# -------------------------------
# GET список рецептів з фільтрацією
# -------------------------------
def get_recipes(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    category_id: Optional[int] = None,
    tag_ids: Optional[List[int]] = None
):
    query = db.query(models.Recipe).options(
        joinedload(models.Recipe.category),
        joinedload(models.Recipe.tags)
    )
    if search:
        query = query.filter(models.Recipe.title.contains(search))
    if category_id:
        query = query.filter(models.Recipe.category_id == category_id)
    if tag_ids:
        query = query.join(models.Recipe.tags).filter(models.Tag.id.in_(tag_ids))
    return query.offset(skip).limit(limit).all()

# -------------------------------
# GET рецепт по id
# -------------------------------
def get_recipe_by_id(db: Session, recipe_id: int):
    try:
        return db.query(models.Recipe).options(
            joinedload(models.Recipe.category),
            joinedload(models.Recipe.tags),
            joinedload(models.Recipe.ratings),
            joinedload(models.Recipe.comments)
        ).filter(models.Recipe.id == recipe_id).first()
    except Exception as e:
        # Fallback без ratings та comments якщо є проблеми з зв'язками
        print(f"Error loading with relationships, falling back: {e}")
        return db.query(models.Recipe).options(
            joinedload(models.Recipe.category),
            joinedload(models.Recipe.tags)
        ).filter(models.Recipe.id == recipe_id).first()

# -------------------------------
# CREATE новий рецепт
# -------------------------------
def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    # Обробляємо steps - може бути string або список CookingStep
    steps_data = recipe.steps
    if isinstance(recipe.steps, list):
        # Конвертуємо CookingStep об'єкти в словники
        steps_data = [step.model_dump() if hasattr(step, 'model_dump') else step for step in recipe.steps]
    
    db_recipe = models.Recipe(
        title=recipe.title,
        description=recipe.description,
        ingredients=[ing.model_dump() for ing in recipe.ingredients],  # конвертуємо у список dict
        steps=steps_data,  # може бути string або список dict
        servings=recipe.servings,
        category_id=recipe.category_id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    if recipe.tags:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(recipe.tags)).all()
        db_recipe.tags.extend(tags)
        db.commit()
        db.refresh(db_recipe)

    return db_recipe

# -------------------------------
# UPDATE рецепт
# -------------------------------
def update_recipe(db: Session, recipe_id: int, recipe: schemas.RecipeCreate):
    db_recipe = get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        return None

    # Обробляємо steps - може бути string або список CookingStep
    steps_data = recipe.steps
    if isinstance(recipe.steps, list):
        # Конвертуємо CookingStep об'єкти в словники
        steps_data = [step.model_dump() if hasattr(step, 'model_dump') else step for step in recipe.steps]

    db_recipe.title = recipe.title
    db_recipe.description = recipe.description
    db_recipe.ingredients = [ing.model_dump() for ing in recipe.ingredients]
    db_recipe.steps = steps_data
    db_recipe.servings = recipe.servings
    db_recipe.category_id = recipe.category_id

    if recipe.tags is not None:
        db_recipe.tags = db.query(models.Tag).filter(models.Tag.id.in_(recipe.tags)).all()

    db.commit()
    db.refresh(db_recipe)
    return db_recipe

# -------------------------------
# DELETE рецепт
# -------------------------------
def delete_recipe(db: Session, recipe_id: int):
    db_recipe = get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        return False
    db.delete(db_recipe)
    db.commit()
    return True

# ==========================
# CRUD операції для категорій
# ==========================

def get_categories(db: Session):
    """
    Отримати всі категорії.
    """
    return db.query(models.Category).all()

def get_category_by_id(db: Session, category_id: int):
    """
    Отримати категорію за ID.
    """
    return db.query(models.Category).filter(models.Category.id == category_id).first()

# -------------------------------
# CREATE нова категорія
# -------------------------------
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# -------------------------------
# UPDATE категорія
# -------------------------------
def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return None
    
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return db_category

# -------------------------------
# DELETE категорія
# -------------------------------
def delete_category(db: Session, category_id: int):
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return False
    
    db.delete(db_category)
    db.commit()
    return True

# ==========================
# CRUD операції для тегів
# ==========================

def get_tags(db: Session):
    """
    Отримати всі теги.
    """
    return db.query(models.Tag).all()

def get_tag_by_id(db: Session, tag_id: int):
    """
    Отримати тег за ID.
    """
    return db.query(models.Tag).filter(models.Tag.id == tag_id).first()

# -------------------------------
# CREATE новий тег
# -------------------------------
def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# -------------------------------
# UPDATE тег
# -------------------------------
def update_tag(db: Session, tag_id: int, tag: schemas.TagCreate):
    db_tag = get_tag_by_id(db, tag_id)
    if not db_tag:
        return None
    
    db_tag.name = tag.name
    db.commit()
    db.refresh(db_tag)
    return db_tag

# -------------------------------
# DELETE тег
# -------------------------------
def delete_tag(db: Session, tag_id: int):
    db_tag = get_tag_by_id(db, tag_id)
    if not db_tag:
        return False
    
    db.delete(db_tag)
    db.commit()
    return True

# ==========================
# CRUD операції для рейтингів
# ==========================

def create_or_update_rating(db: Session, rating_data: schemas.RatingCreate, user_id: Optional[int] = None):
    """
    Створює або оновлює рейтинг рецепту.
    Для зареєстрованих користувачів використовує user_id, для анонімних - session_id.
    """
    # Перевіряємо чи існує вже рейтинг від цього користувача/сесії
    query = db.query(models.Rating).filter(models.Rating.recipe_id == rating_data.recipe_id)
    
    if user_id:
        existing_rating = query.filter(models.Rating.user_id == user_id).first()
    else:
        existing_rating = query.filter(models.Rating.session_id == rating_data.session_id).first()
    
    if existing_rating:
        # Оновлюємо існуючий рейтинг
        existing_rating.rating = rating_data.rating
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    else:
        # Створюємо новий рейтинг
        new_rating = models.Rating(
            recipe_id=rating_data.recipe_id,
            user_id=user_id,
            session_id=rating_data.session_id if not user_id else None,
            rating=rating_data.rating
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating

def get_recipe_stats(db: Session, recipe_id: int) -> schemas.RecipeStats:
    """
    Отримує статистику рецепту: середній рейтинг, кількість оцінок та коментарів.
    """
    # Середній рейтинг та кількість оцінок
    rating_stats = db.query(
        func.avg(models.Rating.rating).label('avg_rating'),
        func.count(models.Rating.id).label('total_ratings')
    ).filter(models.Rating.recipe_id == recipe_id).first()
    
    # Кількість коментарів
    total_comments = db.query(func.count(models.Comment.id)).filter(
        models.Comment.recipe_id == recipe_id
    ).scalar()
    
    return schemas.RecipeStats(
        average_rating=float(rating_stats.avg_rating) if rating_stats.avg_rating else None,
        total_ratings=rating_stats.total_ratings or 0,
        total_comments=total_comments or 0
    )

def get_user_rating(db: Session, recipe_id: int, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """
    Отримує рейтинг користувача для рецепту.
    """
    query = db.query(models.Rating).filter(models.Rating.recipe_id == recipe_id)
    
    if user_id:
        return query.filter(models.Rating.user_id == user_id).first()
    elif session_id:
        return query.filter(models.Rating.session_id == session_id).first()
    
    return None

# ==========================
# CRUD операції для коментарів
# ==========================

def create_comment(db: Session, comment_data: schemas.CommentCreate, user_id: Optional[int] = None):
    """
    Створює новий коментар до рецепту.
    """
    new_comment = models.Comment(
        recipe_id=comment_data.recipe_id,
        user_id=user_id,
        session_id=comment_data.session_id if not user_id else None,
        author_name=comment_data.author_name,
        content=comment_data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

def get_recipe_comments(db: Session, recipe_id: int, skip: int = 0, limit: int = 50):
    """
    Отримує коментарі до рецепту з пагінацією.
    """
    return db.query(models.Comment).filter(
        models.Comment.recipe_id == recipe_id
    ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()

def update_comment(db: Session, comment_id: int, content: str, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """
    Оновлює коментар (тільки власник може редагувати).
    """
    query = db.query(models.Comment).filter(models.Comment.id == comment_id)
    
    if user_id:
        comment = query.filter(models.Comment.user_id == user_id).first()
    elif session_id:
        comment = query.filter(models.Comment.session_id == session_id).first()
    else:
        return None
    
    if comment:
        comment.content = content
        db.commit()
        db.refresh(comment)
        return comment
    
    return None

def delete_comment(db: Session, comment_id: int, user_id: Optional[int] = None, session_id: Optional[str] = None):
    """
    Видаляє коментар (тільки власник може видалити).
    """
    query = db.query(models.Comment).filter(models.Comment.id == comment_id)
    
    if user_id:
        comment = query.filter(models.Comment.user_id == user_id).first()
    elif session_id:
        comment = query.filter(models.Comment.session_id == session_id).first()
    else:
        return False
    
    if comment:
        db.delete(comment)
        db.commit()
        return True
    
    return False

