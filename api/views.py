# backend/api/views.py

import json
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openai import OpenAI
from django.conf import settings


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class GeneratePlan(APIView):
    def post(self, request):
        kw         = request.data.get('keyword', '').strip()
        lang       = request.data.get('lang', 'en').lower()
        start_date = request.data.get('start_date', '').strip()
        end_date   = request.data.get('end_date', '').strip()

        if not kw:
            return Response(
                {'error': '키워드를 입력하세요.' if lang=='ko' else 'Please enter a keyword.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not start_date or not end_date:
            msg = '시작일과 종료일을 모두 입력하세요.' if lang=='ko' else 'Please provide both start_date and end_date.'
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)

        if lang == 'ko':
            prompt = f"""
당신은 전문가 수준의 프로젝트 플래너입니다.

입력값:
- 키워드: "{kw}"
- 시작일: "{start_date}"
- 종료일: "{end_date}"

설명:
오직 입력된 키워드 정보만을 기반으로, 그 분야의 핵심 기술·지표·방법론·수치·조건·환경을 모두 반영해,  
"기획 → Phase → 상위 Task → 하위 Task(2~3단계) → fork/join → condition 분기 → 마무리(Closure)" 
까지 완전한 워크플로우를 **극도로 세세하게** 기획하세요.

요청:
1. "{kw}" 프로젝트에 특화된 **5~7개 Phase**를 정의하세요.
2. 각 Phase마다 **3~5개의 상위 Task**를 생성하세요.
3. 각 상위 Task를 **반드시 2~3개의 하위 Task**로 분해하세요.  
   - 하위 Task 설명에 반드시 “무엇을(What)”, “왜(Why)”, “어떻게(How)”,  
     “수치(숫자·단위)·조건(예: ≥90%)·환경(예: Python3.9)” 정보를 포함해야 합니다.
4. “동시에 처리”가 필요한 Task 그룹엔 **fork** 구조("dependsOn: []")로,  
   여러 흐름을 합쳐야 할 곳엔 **join** 구조(`dependsOn`에 복수 id)로 자동 표현하세요.
5. 필요 시 “조건 분기”가 들어갈 지점을 자동 판단해  
   "type": "condition" 노드와 **Yes/No 라벨**이 붙은 엣지를 생성하세요.
6. 모든 Task(id·상위/하위/condition) 객체에 **반드시** 아래 필드를 포함하세요:
- "id": 고유 문자열("n1","n2",…)
   - "parentId": 상위 Task id 또는 null
   - "type": "task" 또는 "condition"
   - "data": {{
       "role": 역할 이름(예: "Backend - API 구현"),
       "task": Task 설명 또는 분기 질문,
       "model": 사용 도구/프레임워크(예: "FastAPI v0.95"),
       "dependsOn": [선행 Task id 리스트],
       "failureFallback": 대체 Task id 또는 "",
       "notes": "무엇을, 왜, 어떻게" + 수치·조건·환경 상세 설명
     }}
   - "position": {{ "x":0, "y":0 }}
7. "linkDataArray" 엣지에도 **"id"**, **"source"**, **"target"**,  
   **"label"**(조건 분기 Yes/No) 필드를 포함하세요.
8. 마지막 Phase(Closure)에는 **반드시**  
   - 산출물 최종 검토·문서화  
   - 시스템 철수·전환 계획  
   - 최종 회고 워크숍  
   과 같은 Task를 자동 생성하게 하세요.
9. **반환값은 맨 처음 “{"**, **마지막"}”** 로만 이루어진 **단 하나의**,  
   **valid JSON 객체**여야 합니다.  
   부가 설명, 예시, 마크다운, 주석은 절대 포함하지 마세요.

최종 출력은 반드시 아래 구조로 이루어진 **순수 JSON**만 출력하십시오 (설명, 마크다운, 기타 텍스트 절대 금지):

{{
  "nodeDataArray": [...],
  "linkDataArray": [...]
}}

"""

        else:
            prompt = f"""
You are an expert‐level project planner.

Input:

Keyword: "{kw}"
Start Date: "{start_date}"
End Date: "{end_date}"

Description:
Based solely on the provided keyword information, incorporate all the core technologies, metrics, methodologies, quantitative criteria, conditions, and environmental factors relevant to that field to plan an exhaustive workflow from "Initiation → Phases → High‑Level Tasks → Sub‑Tasks (2–3 levels) → Fork/Join → Condition Branches → Closure" in extreme detail.

Requirements:
1. Define **5~7 Phases** specialized for the "{kw}" project.
2. For each Phase, generate **3~5 High‑Level Tasks.
3. Decompose each High‑Level Task into exactly 2–3 Sub‑Tasks.
4. Each Sub‑Task description must include “What”, “Why”, “How”, and quantitative metrics (numbers/units), conditions (e.g., ≥90%), and environmental details (e.g., Python 3.9).
5. Represent concurrently executable Task groups with a “fork” structure (dependsOn: []) and merging flows with a “join” structure (dependsOn containing multiple IDs).
6. Automatically insert Condition Branch nodes ("type": "condition") with Yes/No labeled edges where appropriate.
7. Every Task (both High‑Level and Sub‑Task) and Condition node must include the following fields:
-"id": unique string ("n1", "n2", …)
-"parentId": ID of the parent Task or null
-"type": "task" or "condition"
-"data": {{
    "role": role name (e.g., "Backend – API Implementation"),
    "task": Task description or branch question,
    "model": tools/frameworks (e.g., "FastAPI v0.95"),
    "dependsOn": [list of preceding Task IDs],
    "failureFallback": alternative Task ID or "",
    "notes": detailed explanation of What, Why, How + quantitative criteria, conditions, and environment
    }}

"position": {{ "x": 0, "y": 0 }}

Every entry in "linkDataArray" must include "id", "source", "target", and "label" (Yes/No for condition branches).

The final Phase (Closure) must include tasks such as final deliverable review/documentation, system decommissioning/transition planning, and final retrospective workshop.

The return value must be a single valid JSON object, starting with {{ and ending with }}, with no extra explanation, examples, markdown, or comments.

Final output must be purely JSON in the following structure (no additional text):

{{
"nodeDataArray": [...],
"linkDataArray": [...]
}}
"""

        try:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You output only ReactFlow JSON spec: { nodeDataArray, linkDataArray }."
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
            )
            spec_str = resp.choices[0].message.content.strip()
            spec = json.loads(spec_str)
            Diagram.objects.create(
                keyword=kw,
                lang=lang,
                start_date=start_date,
                end_date=end_date,
                spec=spec
            )
            return Response(spec)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
from rest_framework import generics
from .models import Diagram
from .serializers import DiagramSerializer
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView

class DiagramCreateView(generics.CreateAPIView):
    queryset = Diagram.objects.all()
    serializer_class = DiagramSerializer


class DiagramDetailView(RetrieveUpdateAPIView):
    queryset = Diagram.objects.all()
    serializer_class = DiagramSerializer
    lookup_field = 'id'

    