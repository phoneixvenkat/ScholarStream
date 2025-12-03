# AWS Deployment Guide for ScholarStream

## Current Status

**Deployment Status:** Cloud-ready architecture, local deployment  
**Reason:** Cost optimization and data privacy for development phase  
**Cloud Migration:** Designed and documented, ready when scale demands

---

## Architecture Design

ScholarStream is designed with cloud deployment in mind from day one:

### Cloud-Ready Design Principles:
✅ **Stateless API** - No server-side sessions, any instance handles any request  
✅ **Containerization Ready** - Dockerfile and docker-compose.yml included  
✅ **Environment Configuration** - 12-factor app principles  
✅ **Horizontal Scaling** - Load balancer ready  
✅ **Database Sharding** - Designed for distributed storage  

---

## AWS Deployment Architecture

### Proposed AWS Infrastructure:

```
┌─────────────────────────────────────────────┐
│         CloudFront CDN (Frontend)           │
│            S3 Static Hosting                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Application Load Balancer (ALB)        │
│         Health Checks + Auto-scaling        │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│   ECS     │ │   ECS     │ │   ECS     │
│ Container │ │ Container │ │ Container │
│ (Backend) │ │ (Backend) │ │ (Backend) │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │
      └─────────────┼─────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   RDS       │ │     S3      │ │ OpenSearch  │
│  Aurora     │ │  Documents  │ │   Vectors   │
│ (Metadata)  │ │   Storage   │ │  Database   │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## AWS Services

### 1. Frontend (Static Hosting)
**Service:** S3 + CloudFront  
**Purpose:** Serve React application  
**Cost:** ~$20/month (100 users)

### 2. Backend API
**Service:** ECS Fargate  
**Purpose:** Run FastAPI containers  
**Scaling:** 2-10 containers based on load  
**Cost:** ~$50-200/month

### 3. Load Balancer
**Service:** Application Load Balancer (ALB)  
**Purpose:** Distribute traffic, health checks  
**Cost:** ~$20/month

### 4. Database - Metadata
**Service:** RDS Aurora PostgreSQL  
**Purpose:** User data, document metadata  
**Cost:** ~$30-150/month

### 5. Database - Vectors
**Service:** Amazon OpenSearch  
**Purpose:** Vector similarity search (replaces ChromaDB)  
**Cost:** ~$80-300/month

### 6. Storage
**Service:** S3  
**Purpose:** Document storage (PDFs)  
**Cost:** ~$10-50/month

### 7. LLM Inference
**Service:** SageMaker or Bedrock  
**Purpose:** Model hosting  
**Cost:** ~$500-2,000/month (GPU instances)

### 8. Monitoring
**Service:** CloudWatch + X-Ray  
**Purpose:** Logs, metrics, tracing  
**Cost:** ~$20/month

---

## Cost Estimates

### Small Scale (100 users):
```
CloudFront/S3:    $20
ECS Fargate:      $50
ALB:              $20
RDS Aurora:       $30
OpenSearch:       $80
S3 Storage:       $10
CloudWatch:       $20
─────────────────────
TOTAL:           ~$230/month
```

### Medium Scale (1,000 users):
```
CloudFront/S3:    $50
ECS Fargate:      $200
ALB:              $25
RDS Aurora:       $150
OpenSearch:       $300
S3 Storage:       $50
SageMaker:        $500
CloudWatch:       $50
─────────────────────
TOTAL:           ~$1,325/month
```

### Large Scale (10,000 users):
```
CloudFront/S3:    $100
ECS Fargate:      $1,000
ALB:              $50
RDS Aurora:       $500
OpenSearch:       $1,000
S3 Storage:       $200
SageMaker:        $2,000
CloudWatch:       $150
─────────────────────
TOTAL:           ~$5,000/month
```

---

## Why Local Deployment Now?

### Decision Rationale:

1. **Cost Optimization**
   - Development: $0/month vs $230-5,000/month
   - ROI calculation: Migrate when >100 active users

2. **Data Privacy**
   - Educational documents stay on-premises
   - No data transmission to third parties
   - Compliance with institutional policies

3. **Rapid Development**
   - Faster iteration without cloud complexity
   - No network latency during testing
   - Immediate debugging access

4. **Future Flexibility**
   - Architecture designed for cloud from start
   - Migration path documented and ready
   - Can deploy to AWS/Azure/GCP when needed

---

## Migration Timeline

### Phase 1: Containerization (1-2 weeks)
- ✅ Dockerfile created (included in repo)
- ✅ docker-compose.yml created (included in repo)
- ⏳ Test containers locally
- ⏳ Build and push to ECR (Elastic Container Registry)

### Phase 2: AWS Setup (2-3 weeks)
- ⏳ Create VPC and security groups
- ⏳ Set up RDS Aurora instance
- ⏳ Configure S3 buckets
- ⏳ Deploy ECS cluster with Fargate
- ⏳ Configure ALB with target groups

### Phase 3: Data Migration (1 week)
- ⏳ Export ChromaDB data
- ⏳ Import to OpenSearch
- ⏳ Upload documents to S3
- ⏳ Migrate metadata to Aurora

### Phase 4: Testing & Cutover (1 week)
- ⏳ Load testing
- ⏳ Security testing
- ⏳ DNS cutover
- ⏳ Monitor and optimize

**Total Timeline:** 5-7 weeks for full AWS migration

---

## Current Implementation

### What We Have:
✅ Production-quality code  
✅ Horizontal scaling design  
✅ Stateless API architecture  
✅ Docker files prepared  
✅ Environment-based configuration  
✅ Health check endpoints  
✅ Comprehensive logging  

### What's Ready for Cloud:
✅ Containerization (Dockerfile + docker-compose)  
✅ Configuration management (environment variables)  
✅ Database abstraction (easy to swap ChromaDB → OpenSearch)  
✅ Stateless design (no sticky sessions needed)  
✅ API-first architecture (microservices ready)  

---

## Conclusion

ScholarStream demonstrates **cloud-ready architecture** while maintaining **cost-effective local deployment**. The system is designed with distributed systems principles from day one:

- Stateless API enables horizontal scaling
- Containerization prepared for any cloud platform
- Database sharding strategy documented
- Load balancing ready architecture
- Comprehensive monitoring planned

**This approach follows industry best practices:** Build for current scale (local), design for future scale (cloud), migrate when ROI justifies investment.

**Current Decision:** Local deployment = $0/month  
**Future Path:** AWS deployment when >100 active users justify $230-5,000/month cost

**Best of both worlds:** Cost efficiency now + scalability path ready.
