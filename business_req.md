---

# Product Requirements Document (PRD)

## Rental Property Management Platform

**Version 1.0 | Status: Business Freeze Draft**

---

## 1. Business Overview

المنصة دي بتخدم **broker/agent** عنده علاقات مع ملاك شقق في مناطق سياحية وسكنية مميزة. المشكلة الأساسية هي إن العمل كان قائم على سمسرة غير منظمة، والهدف هو تحويله لـ business منظم بالكامل.

نموذج العمل: **Commission-based** — المنصة لا تشتري ولا تؤجر لنفسها، لكنها تجيب clients للملاك وتأخذ نسبة.

المناطق الحالية: Palm Hills, Abraj Al Alamein, وغيرهم — وهذه المناطق كيان مستقل في النظام يمكن إضافته وإدارته.

---

## 2. User Personas

| Persona | الدور | الصلاحيات |
| --- | --- | --- |
| **Admin** | مشغل المنصة | كامل الصلاحيات على كل شيء |
| **Sales** | فريق المبيعات | CRM + تواصل مع clients |
| **Finance** | مسؤول مالي | Finance tab فقط |
| **Tech** | مسؤول تقني | وصول تقني محدود |
| **Owner** | صاحب الشقة | يشوف بس: availability، حجوزاته، أرباحه |
| **End User / Client** | الزبون | يتصفح، يختار، يحجز |

---

## 3. Core Entities in the System

```
Areas (مناطق)
  └── Units / Properties (وحدات/شقق)
        └── Availability Calendar
              └── Bookings
                    └── Payments
                          └── Finance Records

Owners ←→ Units
Clients ←→ Bookings ←→ CRM Cases
```

---

## 4. Booking Lifecycle (Pipeline)---

## 5. CRM Module — Business Rules

**Pipeline Logic:**

- الـ Admin والـ Sales فقط يقدروا يحركوا الـ case في الـ pipeline
- الـ Owner لا يملك أي تحكم في الـ pipeline
- لما client يعمل booking من الموقع → الحالة بتكون **Pending** تلقائياً (مش Booked) لحد ما Sales يكلمه
- الـ **Soft Hold** على الأيام المطلوبة: لا توجد مدة زمنية محددة — تفضل معلقة لحد ما الـ Sales يقرر
- التحويل لـ **Confirmed** يحدث بعد: الـ Admin يُدخل العربون يدوياً في النظام (لا توجد مراجعة — الإدخال = تأكيد)

**Case Details (بطاقة كل client):**

- اسم الـ client + بيانات التواصل
- الوحدة المختارة + المنطقة + التواريخ
- Notes حرة (مزاج العميل، تفاصيل العيلة، ملاحظات خاصة)
- تاريخ التعاملات السابقة مع نفس المنصة (retention view)
- الدفعات المرتبطة بالحجز

---

## 6. Properties (Units) Module

**إدارة الوحدات:**

- كل وحدة تنتمي لـ **منطقة** (Area) وتنتمي لـ **owner**
- بيانات الوحدة: صور، وصف، موقع، سعر
- **التسعير:** يختلف حسب الوحدة والمالك — لا يوجد سعر موحد
- **Seasonal Pricing:** ممكن — أسعار مختلفة حسب الشهر أو المناسبة (موسم عالي، أعياد)
- **Discounts:** ممكن
- **Minimum Stay:** لا يوجد
- **Owner permissions على الوحدة:** يشوف الـ availability بس — لا يوافق على الحجوزات ولا يرفضها

**Availability:**

- لما حجز يتأكد (Confirmed) → الأيام دي تُحذف تلقائياً من الـ availability
- الـ Pending booking لا تحذف الأيام نهائياً — بس تظهر كـ "soft hold" داخلياً للـ Admin

---

## 7. Finance Module

### 7.1 Revenue Overview (Admin View)

- **Total Revenue:** إجمالي كل الفلوس اللي دخلت
- **Total Commission Earned:** نسبة المنصة من الكل
- **Total Paid to Owners:** إجمالي اللي اتحول للملاك
- **Total Outstanding:** اللي لسه مستحق للملاك

### 7.2 Transaction Log

كل عملية بتظهر:

- اسم الـ client + اسم الـ owner + الوحدة
- قيمة الحجز + نسبة العمولة + المبلغ المستحق للـ owner
- تاريخ الحجز، تاريخ الدفع

### 7.3 Owner Payouts

- الدفع للملاك يتم **يدوياً** (Instapay / Vodafone Cash)
- الـ Admin يسجل الدفعة في النظام: يختار الـ owner، يكتب المبلغ والتاريخ، ويرفق صورة إثبات
- يمكن تسجيل الدفع من: Finance tab أو من Profile الـ owner مباشرة
- **Owner Payout Cycle:** ممكن تكون monthly batch
- تاريخ الدفعات يظهر في profile الـ owner: دُفع X بتاريخ Y، متبقي Z

### 7.4 Cancellation & Refund Policy

- إلغاء بعد الـ Confirmed = **لا يوجد استرداد للعربون**
- في حالة وجود مشكلة موثقة = يمكن للـ Admin تسجيل **Refund يدوياً**
- الـ Refunds تُسجل في النظام وتظهر في الـ Finance log

---

## 8. Admin Dashboard — Tabs Structure

| Tab | المحتوى |
| --- | --- |
| **Dashboard** | Overview: revenue, active bookings, top areas, occupancy |
| **Areas** | إدارة المناطق — إضافة، تعديل، عرض تحليلات لكل منطقة |
| **Units** | كل الوحدات، فلترة بالمنطقة والـ owner والـ status |
| **CRM** | Pipeline view لكل الـ leads والـ cases |
| **Owners** | قائمة الملاك + profiles + payouts |
| **Clients** | قائمة العملاء + profiles + تاريخ الحجوزات |
| **Finance** | Revenue + transactions + owner payouts + refunds |
| **Settings** | Admin users + permissions + system config |

---

## 9. Owner Profile (Admin View)

- بيانات المالك الأساسية + رقم التواصل
- قائمة وحداته + availability لكل وحدة
- إجمالي الإيرادات المحققة + المدفوع + المتبقي
- فلتر بالشهر / الفترة
- تاريخ الدفعات
- Notes على المالك
- خيار إيقاف الحساب أو الوحدات

---

## 10. Client Profile (Admin View)

- بيانات العميل + رقم التواصل
- كل حجوزاته: مع مين، فين، متى، كم يوم، كم شخص
- إجمالي المصروف معنا
- عدد مرات الحجز (Retention indicator)
- آخر تعامل
- Notes حرة
- الفواتير المرتبطة (لو موجودة)

---

## 11. Areas Module

- كل منطقة ليها: اسم، وصف، صور
- الوحدات بتنتمي للمناطق
- على الـ dashboard: تحليل لكل منطقة (أكثر منطقة إيراداً، أعلى نسبة إشغال)
- الـ end user يتصفح بالمنطقة

---

## 12. Admin User Roles & Permissions

| Role | CRM | Units | Finance | Owners | Settings |
| --- | --- | --- | --- | --- | --- |
| Super Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sales | ✓ | View | — | — | — |
| Finance | — | View | ✓ | View | — |
| Tech | View | ✓ | — | — | ✓ |

---

## 13. Data Integrity Rules

- أي تغيير في الـ booking status → ينعكس فوراً على: الـ availability، الـ CRM، الـ Finance
- البيانات موحدة — ما يظهرش للـ admin غير اللي يظهر للـ owner في portal بتاعه
- الـ owner portal يشوف فقط وحداته — لا يشوف بيانات ملاك تانيين

---

ممتاز — خلينا نقفل الـ business نهائياً بالإجابات دي:

---

# Business Freeze — Final Decisions Log

| # | السؤال | القرار |
| --- | --- | --- |
| 1 | Invoice generation | تلقائي عند الـ Confirmation |
| 2 | WhatsApp Integration | Phase 2 — مش MVP |
| 3 | Owner Access | Owner Portal مستقل (login خاص بيه) |
| 4 | End User App | في الـ MVP — Web + App معاً |
| 5 | Payment Gateway | مش دلوقتي — بس النظام يتبني يستقبله لاحقاً |
| 6 | Pricing Control | Admin فقط يحدد الأسعار |
| 7 | Commission Rate | تتفاوت لكل Owner (مش موحدة) |

---

## التحديثات اللي اتضافت على الـ PRD:

**Invoice:** بعد ما الـ Admin يدخل العربون وتتحول للـ Confirmed → invoice يتولد تلقائي ويتربط بالـ booking. يظهر في: Client Profile + Finance Log.

**Owner Portal:** الـ Owner عنده login مستقل. يشوف فيه:

- وحداته فقط
- الـ availability بتاعت كل وحدة
- حجوزاته (confirmed فقط — مش pending)
- أرباحه وتاريخ الدفعات

**End User:** Web + Mobile App في الـ MVP.

**Payment Gateway:** النظام يتبني بـ manual payment دلوقتي — بس الـ data model يكون جاهز لاستقبال gateway لاحقاً بدون ما يكسر حاجة.

**Commission:** لكل Owner نسبة commission مختلفة تُحدد من الـ Admin في profile الـ Owner.

**Pricing:** Admin فقط — Owner مش بيقترح ولا بيعدل.

---

## ✅ Business Freeze Confirmed

```
✓ Business Model          Commission-based, per-owner rate
✓ Booking Pipeline        7 stages + 4 exit states
✓ CRM Logic               Defined
✓ Availability Rules      Defined
✓ Pricing Rules           Admin-only, seasonal supported
✓ Finance Logic           Manual payouts + auto invoice
✓ Cancellation Policy     No refund after deposit (exceptions manual)
✓ Owner Access            Independent portal, view-only
✓ End User                Web + App (MVP)
✓ Admin Roles             4 roles with scoped permissions
✓ Areas                   Core entity in system
✓ Payment Gateway         Placeholder architecture only
✓ WhatsApp                Phase 2
```

---

# Final Business Freeze — Complete PRD v2.0

## Rental Property Management Platform

---

## Decision Log — Final Answers

| # | القرار | النتيجة |
| --- | --- | --- |
| Deposit | Sales يحدده يدوياً كرقم (غالباً نسبة بيحسبها هو) | Manual entry بالـ Admin |
| Remaining Payment | يُدفع عند وصول الـ Client للشاليه | At Check-in |
| Payment Flow | Client يدفع للـ Admin فقط | Admin → يوزع على الـ Owner |
| Availability Conflict | الأول اللي ضغط | Instant Soft Hold |
| Lead Accumulation | مفيش — Sales team قوي | No timeout needed |
| Completed Trigger | أوتوماتيك بعد تاريخ الـ Check-out | Auto (unless Early Leave) |
| Notifications | منطقية — موافق | كما اقتُرح |
| Client Account | يتصفح بدون account — عند الحجز يعمل account في نفس الـ form | Seamless signup in booking flow |
| Pricing Control | Admin فقط | Confirmed |
| Search & Filter | موافق | In MVP |
| Invoice Destination | يُحدد لاحقاً | TBD |
| Reviews | في الـ MVP | Confirmed |
| Unit Types | فلل، شاليهات، ستوديوهات | + Amenities filter |
| All Suggestions | موافق عليها كلها | Added to scope |

---

## 1. Business Model — Complete Picture

**النموذج:**
المنصة وسيط بين **ملاك العقارات** و**العملاء**. لا تمتلك ولا تؤجر لنفسها. تجيب clients، تدير العملية كاملة، وتأخذ commission.

**تدفق الأموال:**

```
Client
  └─ يدفع العربون (يحدده Sales) ← عند الـ Confirmation
  └─ يدفع الباقي ← عند الـ Check-in
        ↓
      Admin
        └─ يخصم Commission (نسبة متفاوتة لكل Owner)
        └─ يحول الباقي للـ Owner (يدوياً — Instapay / Vodafone Cash)
```

**Commission:**

- نسبة % مختلفة لكل Owner — يحددها Admin في profile الـ Owner
- تُحسب على إجمالي قيمة الحجز (Total Booking Value)
- تُخصم تلقائياً في حسابات الـ Finance — الدفع الفعلي يدوي

**مثال:**

```
وحدة: 600 جنيه/ليلة × 5 ليالي = 3,000 جنيه Total
Commission: 20% = 600 جنيه ← للمنصة
Owner Net: 2,400 جنيه

عند الـ Confirmation:
  └─ Sales يدخل العربون يدوياً: مثلاً 800 جنيه
  └─ Client يدفع 800 جنيه للـ Admin

عند الـ Check-in:
  └─ Client يدفع الباقي: 2,200 جنيه للـ Admin

Owner يستلم: 2,400 جنيه (في batch شهرية)
```

---

## 2. System Entities

```
Areas (مناطق)
  └── Units (وحدات: فيلا / شاليه / ستوديو)
        ├── Amenities
        ├── Pricing (base + seasonal)
        ├── Availability Calendar
        └── Bookings
              ├── Payments (Deposit + Remaining)
              ├── Invoice (auto-generated)
              └── Review (post-stay)

Owners
  └── Units (واحدة أو أكثر)
  └── Commission Rate
  └── Payout History

Clients
  └── Account (phone required, email optional)
  └── Booking History
  └── Reviews

Admin Users
  └── Roles (Super Admin / Sales / Finance / Tech)
```

---

## 3. User Personas — Full Detail

### Admin (Super Admin)

كامل الصلاحيات. يرى كل شيء. يتحكم في كل شيء.

### Sales

- يشوف ويشتغل على الـ CRM فقط
- يقدر يحول الـ status، يكتب notes، يدخل العربون
- يشوف الـ Units والـ Availability (للحجز من الـ CRM)
- مش بيشوف الـ Finance

### Finance

- يشوف الـ Finance tab كامل
- يسجل الدفعات للـ Owners
- يشوف profiles الـ Owners من ناحية مالية
- مش بيشوف الـ CRM

### Tech

- يشوف الـ Units وإعداداتها
- يشوف الـ System settings
- مش بيشوف الـ Finance ولا الـ CRM

### Owner (Portal مستقل)

- يشوف وحداته فقط
- يشوف الـ Availability (confirmed bookings — مش pending)
- يشوف أرباحه وتاريخ الدفعات
- يشوف الـ Reviews على وحداته
- مش بيشوف بيانات ملاك تانيين أو clients

### End User / Client

- يتصفح بدون account
- عند الحجز: يعمل account في نفس الـ Booking Form (اسم + موبايل + password — إيميل اختياري)
- يشوف حجوزاته وتاريخه
- يقدر يكتب review بعد الـ Stay

---

## 4. Booking Lifecycle — Complete Rules

### المراحل السبعة:

**Prospecting**

- المصدر: واتساب، فورم، مكالمة، App/Website
- الـ source يُسجل تلقائياً في الـ case
- Sales يشوفه في الـ CRM

**Relevant**

- Sales كلمه، مهتم فعلاً
- يبدأ يتكلم عن وحدة معينة أو منطقة

**No Answer** ← Exit مؤقت

- يتعلم على Sales يتابع
- يظهر في الـ CRM مع عداد أيام من آخر محاولة

**Not Relevant** ← Exit نهائي

- مش مهتم — يُغلق الـ Case

**Booked**

- Sales اختار الوحدة والتواريخ من داخل الـ CRM
- الأيام دي تتحول فوراً لـ Soft Hold على الـ Calendar
- Soft Hold: مش بيظهر للـ End Users كـ Available — بس مش Confirmed

**Confirmed**

- Sales يدخل قيمة العربون + يرفع صورة الإثبات
- الإدخال = تأكيد (مفيش مراجعة ثانية)
- الأيام تتحول لـ Booked على الـ Calendar نهائياً
- Invoice يتولد تلقائياً
- Email Notification للـ Client

**Check-in**

- Sales / Admin يحول يدوياً لما Client يوصل
- Client يدفع الباقي عند الوصول
- الدفعة الثانية تُسجل في النظام

**Completed**

- أوتوماتيك بعد تاريخ الـ Check-out بـ 24 ساعة
- شرط: لم يُسجل Early Leave
- يُفعّل طلب Review للـ Client

### Exit States:

**Cancelled (قبل Check-in)**

- بعد الـ Confirmation: العربون لا يُرد (No Refund)
- Admin يقدر يعمل Manual Refund في حالات استثنائية
- الأيام ترجع Available تلقائياً

**Left Early (بعد Check-in)**

- Admin يسجل السبب
- الـ Status تتحول لـ Left Early
- لا يُحسب Completed

### Availability Conflict Rule:

- أول Client يضغط Book على الـ Website/App → الأيام تتحول فوراً لـ Soft Hold
- لا تظهر لأي حد تاني كـ Available
- لو الـ Sales قرر الـ lead مش relevant → يفك الـ Soft Hold يدوياً → الأيام ترجع

---

## 5. Units Module — Full Spec

### بيانات كل وحدة:

- الاسم + النوع (فيلا / شاليه / ستوديو)
- المنطقة (Area)
- المالك (Owner)
- الطاقة الاستيعابية (عدد الأشخاص)
- الوصف
- الصور (متعددة)
- السعر الأساسي (لليلة)
- Seasonal Pricing (أسعار مختلفة لشهور أو مناسبات)
- Amenities (Pool / Parking / Sea View / Gym / Kitchen / etc.)
- حالة الوحدة (Active / Blocked / Inactive)

### Date Blocking:

- Admin فقط يعمل Block على أيام معينة
- الأسباب: Maintenance / Owner Personal Use / Other
- الأيام المـ Blocked لا تظهر كـ Available للـ End User

### Pricing Logic:

```
السعر الفعلي للـ Client =
  Base Price per night
  × عدد الليالي
  ± Seasonal Adjustment (لو في موسم عالي أو منخفض)
  - Discount (لو الـ Admin حطه)
```

---

## 6. Finance Module — Full Spec

### Revenue Overview:

- Total Revenue (كل الفلوس اللي دخلت)
- Total Commission Earned (حصة المنصة)
- Total Paid to Owners (اللي اتحول)
- Total Outstanding (مستحق للملاك لسه)
- فلتر بالشهر / الربع / السنة

### Transaction Log:

كل عملية بتتضمن:

- اسم الـ Client + الوحدة + الـ Owner
- Total Booking Value
- Commission Amount + نسبتها
- Owner Net Amount
- Deposit (المبلغ + التاريخ + صورة الإثبات)
- Remaining Payment (المبلغ + التاريخ)

### Owner Payouts:

- يُسجل من: Finance Tab أو Owner Profile
- البيانات: Owner + المبلغ + التاريخ + صورة إثبات التحويل
- Payout Cycle: شهري (Batch)
- Owner Profile يُظهر: إجمالي مستحق، إجمالي مدفوع، المتبقي، تاريخ كل دفعة

### Refund Management:

- Manual Refund يُسجله Admin فقط
- يظهر في الـ Finance Log كـ Refund (مش Payment)
- يُربط بالـ Booking المعنية

---

## 7. CRM Module — Full Spec

### Case Details (بطاقة كل Lead):

- اسم الـ Client + موبايل
- مصدر الـ Lead (Website / App / WhatsApp / Phone Call / Referral)
- الوحدة المختارة + المنطقة + التواريخ
- عدد الأشخاص
- قيمة العربون (بعد الـ Confirmation)
- Notes حرة (مزاج العميل، تفاصيل العيلة، طلبات خاصة)
- تاريخ التعاملات السابقة مع المنصة (Retention View)
- الدفعات المرتبطة بالحجز

### CRM ↔ System Integration:

- Booking from CRM: Sales يختار الوحدة والتواريخ من داخل الـ CRM مباشرة
- Booking from Website/App: يظهر تلقائياً في الـ CRM كـ Prospecting
- Finance Sync: أي دفعة تُدخل في الـ CRM تظهر في الـ Finance تلقائياً
- Availability Sync: أي تغيير في الـ Status يُحدث الـ Calendar فوراً

---

## 8. Client Account — Seamless Flow

```
Client يتصفح الموقع/الـ App
  └─ يختار الوحدة والتواريخ
  └─ يضغط "Book Now"
        └─ Booking Form يظهر:
              ├─ الاسم (مطلوب)
              ├─ رقم الموبايل (مطلوب)
              ├─ إيميل (اختياري)
              ├─ عدد الأشخاص (مطلوب)
              ├─ Password (مطلوب — لإنشاء الـ Account)
              └─ ملاحظات خاصة (اختياري)
  └─ يضغط Submit
        └─ Account يتعمل تلقائياً
        └─ Booking تظهر في الـ CRM كـ Prospecting (Pending)
        └─ Email/SMS Confirmation يتبعت
```

---

## 9. Notifications System

| الحدث | مين يتنوتفاي | الطريقة |
| --- | --- | --- |
| New booking from website/app | Sales team | In-app alert |
| Booking Confirmed | Client | Email + SMS |
| Booking Confirmed | Owner | Owner Portal notification |
| Check-in reminder (يوم قبل) | Client | Email + SMS |
| Check-out reminder (صبح يوم الـ Check-out) | Admin | In-app reminder |
| Owner payout recorded | Owner | Portal notification |
| No Answer lead (3+ أيام بدون follow-up) | Sales | In-app reminder |
| Booking auto-completed | Admin | In-app log |

---

## 10. End User Experience — Search & Discovery

### Homepage:

- Cards للـ Areas (مناطق) — الأكثر حجزاً تظهر أول
- Featured Units
- Search bar: المنطقة + التواريخ + عدد الأشخاص

### Search Results:

**Filters:**

- المنطقة
- التواريخ (Availability check فوري)
- عدد الأشخاص (حسب الـ Capacity)
- نوع الوحدة (فيلا / شاليه / ستوديو)
- Amenities (Pool, Sea View, Parking, etc.)
- نطاق السعر

**Sort:**

- الأرخص
- الأعلى تقييماً
- الأكثر حجزاً

### Unit Page:

- الصور (Gallery)
- الوصف + النوع + المنطقة
- الطاقة الاستيعابية
- Amenities
- السعر (مع الـ Seasonal Pricing إن وُجد)
- Availability Calendar (يُظهر الأيام المتاحة والمحجوزة)
- Reviews (التقييمات السابقة)
- زرار "Book Now"

---

## 11. Reviews System (MVP)

- يُفعّل تلقائياً 24 ساعة بعد الـ Completed
- Email للـ Client: "قيّم تجربتك"
- التقييم: 5 Stars + Comment نصي (اختياري)
- يظهر على: صفحة الوحدة (للـ End Users) + Owner Profile (للـ Admin)
- Admin يقدر يُخفي Review (لو Inappropriate)

---

## 12. Admin Dashboard Intelligence

**Actionable Alerts:**

- X leads مش اتكلم عليهم أكتر من 3 أيام
- وحدة X مفيهاش حجز منذ 30 يوم
- Owner Y عنده مبلغ مستحق من 30+ يوم

**Key Metrics:**

- Occupancy Rate لكل وحدة ولكل منطقة
- Revenue by Area / by Owner / by Month
- Top performing units
- Conversion Rate (Prospecting → Confirmed)
- Average Stay Duration

---

## 13. MVP Scope — Locked

**IN MVP:**
Areas · Units (3 types) · Amenities · Availability Calendar · Seasonal Pricing · Date Blocking · Booking Flow (Web + App) · Seamless Account Creation · Search & Filter · CRM Pipeline · Case Details · Booking Source Tracking · Manual Payment Recording + Proof Upload · Auto Invoice · Finance Dashboard · Owner Payouts · Owner Portal · Admin Roles (4) · Client Profiles · Owner Profiles · Notifications (Email) · Reviews · Auto-Complete · Availability Conflict Protection · Commission per Owner

**PHASE 2:**
WhatsApp Integration · Payment Gateway · SMS Notifications · Advanced Analytics · Owner Earnings Forecast · Promo Codes · Referral System

---

## ✅ Business 100% Frozen

```
✓ Business Model & Revenue Flow
✓ All User Personas & Permissions
✓ Complete Booking Lifecycle (7 stages + 4 exits)
✓ Payment Flow (Deposit + Remaining + Owner Payout)
✓ Commission Logic
✓ CRM Rules & Integration Points
✓ Availability & Conflict Logic
✓ Unit Types & Amenities
✓ Search & Filter Logic
✓ Client Account Flow
✓ Notifications Map
✓ Reviews System
✓ Finance Module
✓ Admin Dashboard Intelligence
✓ MVP vs Phase 2 Defined
```

---
