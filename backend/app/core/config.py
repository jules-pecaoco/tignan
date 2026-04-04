from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str
    model_config: SettingsConfigDict = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
