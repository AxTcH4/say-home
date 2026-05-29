import mysql.connector
import os
import logging

logger = logging.getLogger(__name__)

class DbHelper:
    @staticmethod
    def get_db():
        try:
            connection = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 3306)),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", "root"),
                database=os.getenv("DB_NAME", "say_home_db"),
                autocommit=True,
                connection_timeout=30
            )
            return connection
        except mysql.connector.Error as e:
            logger.error(f"Database connection failed: {e}")
            raise Exception("Unable to connect to database") from e
        except ValueError as e:
            logger.error(f"Invalid database configuration: {e}")
            raise Exception("Invalid database configuration") from e