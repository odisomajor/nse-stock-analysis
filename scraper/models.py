from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String(10), unique=True, index=True)
    name = Column(String(255))
    sector = Column(String(100))
    description = Column(String)
    website = Column(String)
    
    # Relationships
    stock_prices = relationship("StockPrice", back_populates="company")
    news = relationship("NewsArticle", back_populates="company")

class StockPrice(Base):
    __tablename__ = "stock_prices"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    date = Column(Date, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
    
    company = relationship("Company", back_populates="stock_prices")

class NewsArticle(Base):
    __tablename__ = "news_articles"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    title = Column(String(255))
    url = Column(String, unique=True)
    source = Column(String)
    published_at = Column(DateTime)
    
    company = relationship("Company", back_populates="news")
