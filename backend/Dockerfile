FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir --upgrade -r requirements.txt
RUN pip install fastapi uvicorn

COPY . /app 

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8501"]