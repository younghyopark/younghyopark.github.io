---
title: "Boston Dynamics Webinar Review"
date: "2025-11-19"
author: "Younghyo Park"
tags: ["review"]
excerpt: "Boston Dynamic's grounded view on humanoid robots as business models, and research agendas."
featured: false
publish: true
---

> This is a written summary / review form the recently released webinar from Boston Dynamics for anyone who doesn't want to sit through an hour-long video.

<iframe width="100%" height="500" src="https://www.youtube.com/embed/laexcnaTrDM?si=zMbWOIyc77wVw4vq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## 1. Participants and Roles

- **Moderator / Product Lead**
  - Name (as spoken): *Aya Durbin* (on the Atlas product team).
  - Role: Leads **humanoid application product strategy** for Atlas.
  - Responsibilities:
    - Decides **where Atlas will first be deployed**.
    - Identifies **which customers and use cases** the robot should target over a long time horizon.
    - Ensures there is a **coherent product roadmap** so that research and development lead to practical, valuable deployments.
  - Background:
    - Previously worked at **6 River Systems**, focused on **warehouse robotics**.
    - Experience designing **human–robot interfaces** and **exception-handling workflows** for AMRs operating alongside people.

- **Alberto Rodriguez**
  - Former **MIT faculty**, joined Boston Dynamics ~**four years ago**.
  - Leads the **Atlas Behavior Team**.
  - Responsibilities:
    - Defines and implements **AI and behavior strategies** for Atlas.
    - Figures out **how Atlas moves and manipulates objects**, and how customers will specify tasks.
    - Owns the long-term goal of making Atlas a **general-purpose manipulation platform**.

---

## 2. Vision: General-Purpose Humanoids and Economic Rationale

### 2.1. Why Humanoids, and Why Now?

- Many customers **see the humanoid shape** and instinctively assume it can:
  - Perform **many types of tasks**.
  - Fit into **existing human environments** without major infrastructure changes.
- The **real appeal** is not the human shape per se, but:
  - **Flexibility**: re-tasking the same machine to different jobs.
  - **Adaptability**: handling **high variability** in real-world situations.

### 2.2. Factory Visits and the “Lighthouse” Task

Alberto’s observations from visiting many factories:

- **Tasks are extremely complex**:
  - Many operations require **fine motor skills**, multi-step coordination, and dynamic stabilization.
- **Much of this work is still done by humans**, even in advanced factories:
  - Not primarily because technology is missing.
  - Often because automation is **economically unattractive** when built as traditional, highly specialized systems.
- Example: **Modern car assembly line**:
  - ~**1,000 cars per day**.
  - Many car models on the same line (e.g., 5–10 variants).
  - Each car has **thousands of parts**, with many **trims and colors**.
  - Enormous **combinatorial variability** in the parts and assemblies.
  - Workers operate at a **tight cadence**, with parts arriving just in time in the right configuration.
- This level of **variability and dexterity** makes classical “hard automation” (custom fixtures, special end-effectors, rigid systems) economically unattractive:
  - Each specialized solution only covers a **narrow slice** of the task space.
  - Updating or extending these systems is very expensive.

  He defines a “lighthouse” example task (the type of problem they target):

  > A worker reaches into a bin of bolts with one hand, picks a bolt, grabs a powered screwdriver with the other hand, inserts the bolt into the tool, then screws it **underneath the car roof**, possibly using the off-hand to brace the body for balance.

- This illustrates:
  - **Bimanual coordination**.
  - **Whole-body balancing**.
  - **Tool use**.
  - **Working in awkward, constrained spaces**.

### 2.3. The Goalpost for Humanoids

- Humanoids aim to **directly attack the limitations of hard automation**:
  - Address **variability** and **generality** instead of tailoring hardware to each specific subtask.
- Alberto’s belief:
  - **No fundamental reason** why such tasks cannot be automated with the right humanoid hardware and AI techniques.
  - Hardware is already **physically capable**.
  - Learning-based methods **should be able to scale** to this complexity.

---

## 3. Reliability and the Three Pillars of Customer Value

### 3.1. Reliability Dimensions

From a product perspective, Aya emphasizes **three pillars**:

1. **Hardware reliability**
   - Robot must physically work for long periods with minimal failures.

2. **Behavior reliability**
   - The robot must **perform specific tasks repeatably** without frequent errors.

3. **Application software reliability**
   - Higher-level software that:
     - Orchestrates workflows.
     - Handles edge cases and exceptions.
     - Provides **predictable operator experience**.

Customers need robots that are:

- **Predictable**: they behave consistently.
- **Configurable**: they follow **site-specific rules** and ways of doing tasks (akin to training a new employee to do things “your way”).

### 3.2. Productization Milestones

- Near-term focus:
  - Show **clear, concrete customer value** now.
  - Hit **intermediate milestones** that justify continued investment.
- Long-term vision:
  - General-purpose humanoids working widely in factories, eventually **homes and retail**.
  - But this requires **phased progress** in reliability and capability.

---

## 4. Three Phases of Product Maturation (Spot / Stretch / Atlas Analogy)

Alberto outlines a **three-phase lifecycle** for complex robot products:

### Phase 1 – Hardware-Limited Development

- Main bottleneck: **hardware reliability**.
- Issues:
  - Frequent mechanical failures.
  - Reliability problems that slow development and field tests.
- Status:
  - **All humanoids today** are in this phase.
  - Atlas is **firmly still in Phase 1**.

### Phase 2 – Learning from Long-Term Deployments (“The Other Bitter Lesson”)

Once hardware is reliable enough for longer field trials:

- Robots are deployed for extended periods for **real customer use**.
- This phase reveals **non-obvious product realities**:
  - Many assumptions were wrong:
    - Wrong level of autonomy.
    - Poor exception handling.
    - Interfaces that don’t fit operators’ actual workflows.
- Alberto calls this **“the other bitter lesson”**:
  - Analogy to Sutton’s “bitter lesson” in AI.
  - Here: **the customer is always right**; your initial product ideas are often wrong.
- In this phase:
  - Product teams iterate rapidly on:
    - Software.
    - UX / interfaces.
    - Workflows.
    - Support tooling and infrastructure.
  - Robots transition from “cool demo” to **usable product**.

### Phase 3 – Large-Scale Hardware Refinement

Once the right product fit and software stack have been established:

- Scaling to **thousands or tens of thousands** of deployed robots reveals **rare failure modes**.
- Hardware becomes the main challenge again, but now:
  - Failures are **low-frequency**, but high-impact.
  - Fixes may require:
    - Changing suppliers.
    - Altering mechanical designs.
    - Updating manufacturing processes.
  - Validating improvements takes **months**, as they must be statistically proven in the field.
- Where BD products are:
  - **Spot** is currently in **Phase 3** (large fleet, rare failure modes being ironed out).
  - **Stretch** is roughly **two years behind Spot**.
  - **Atlas** is roughly **two years behind Stretch** and still in **Phase 1**.

---

## 5. Why Legs? The Legs vs. Wheels Debate

### 5.1. Product View (Aya)

- Acknowledges:
  - **Legs are not needed everywhere**.
  - Many environments can be serviced by **non-legged solutions**.
- But the long-term **humanoid vision**:
  - One robot that can **do almost anything a human can do** in a building.
  - Working across many **applications and environments** without redesigning hardware each time.
- With legs and a human-like form factor:
  - Atlas can, in principle, operate in **any environment** where a human can walk and work.
  - Once software catches up:
    - They don’t need to build a new robot for every new use case.
    - They can **reuse the same platform** for different tasks and sites.
- Accepts that:
  - Other robots will eventually **outperform humanoids** in some niche tasks.
  - That’s fine; it means robotics as a field is expanding and specializing.
- Key requirement:
  - Maintain **positive ROI** for customers.
  - Legs are acceptable as long as the **overall economics work out**.

### 5.2. Engineering View (Alberto)

- Historically, the biggest concern with legs was **dynamic balance**:
  - Keeping a legged robot from falling.
  - Computational complexity for real-time stabilization.
- Recent progress:
  - **Dynamic stability is no longer the main bottleneck**.
  - Legged locomotion has become **manageable** with current control and compute.
- Capabilities of legged platforms:
  - **Slimmer profile**:
    - Easier to navigate **constrained spaces** and narrow openings.
  - **Faster turning and reorientation**:
    - By changing foot contacts discretely, the robot can **pivot quickly**.
    - Wheeled robots must decelerate, steer, and re-accelerate, which can be slower and more complex in tight spaces.
- Engineering cost comparison:
  - Wheeled bases designed to be **stable and omnidirectional** are not obviously cheaper:
    - Often have **multiple wheels**, each requiring **two actuators** (drive + steering).
    - May include vertical DOF (z-axis lift) → more actuators.
    - Higher **overall mass** implies higher **power requirements**.
  - Net effect: total actuator count and complexity can be **similar or even higher** than legs.
- Outstanding challenge:
  - **Safety certification** for dynamically balancing humanoids:
    - No established **regulatory framework** yet.
    - Boston Dynamics is collaborating with other companies to help define:
      - Safety standards.
      - Test procedures.
      - Certifications needed for industrial and (eventually) home deployments.

---

## 6. Why Start in Industrial Manufacturing?

### 6.1. Criteria for the “Beachhead” Market

Boston Dynamics chose **industrial manufacturing** as the initial Atlas target environment because:

1. **Scale**
   - Factories, especially automotive, offer **large-scale opportunities**, making investment worthwhile.

2. **Safety Ramping**
   - Manufacturing environments are:
     - **Structured** in layout and workflow.
     - Amenable to **gradually increasing levels** of human–robot interaction.
   - Early deployment patterns:
     - Keep robots separated from people (e.g., stop when humans are near).
     - Gradually move towards closer collaboration as safety confidence and certifications grow.

3. **Variability and “Manipulation Completeness”**
   - Manufacturing tasks:
     - Highly varied.
     - Require complex **assembly operations**, tool use, and intricate part handling.
   - Alberto’s view: **general assembly lines** (like automotive) are close to **“manipulation complete”**:
     - If Atlas can handle those tasks, it will likely have the skills to do **many other tasks** in other sectors.
   - The parts and assemblies Atlas works with in early trials are often the **same ones** used on the main assembly line, tying short-term work to long-term goals.

---

## 7. AI Brains, Large Behavior Models, and Training Strategy

### 7.1. Traditional Robotics “Pyramid” vs. Learned Behaviors

Alberto contrasts two paradigms:

1. **Classical hierarchical robotics pipeline** (still dominant in many systems today):
   - Input: raw sensor data (camera pixels, tactile feedback, encoders).
   - Multiple layers:
     - Perception: pixels → features → objects → maps.
     - Planning and decision: goals → task plans → motion plans → trajectories.
     - Control: trajectories → torques/currents.
   - Problems:
     - **Maintenance hell**: many components with complex dependencies; small changes cascade across the stack.
     - **Poor scalability**: each new deployment requires **expert engineers** to configure and tune the system.

2. **Modern approach: learned behavior engines**
   - Replace much of the **handcrafted internal structure** with **neural networks**:
     - Systems that are **trained**, not explicitly programmed.
   - Key idea: **behavior is acquired through experience**, primarily demonstrations or trial-and-error.

### 7.2. Pre-training vs. Post-training

He defines two complementary processes:

- **Post-Training (“on-the-job training”)**
  - Analogy: training a new employee for your specific site.
  - For each specific task at each customer:
    - Provide **teleoperated demonstrations**, corrections, and feedback.
    - Improve the robot’s performance on that exact task.
  - Necessary for:
    - Achieving **high performance** in a specific environment.
    - Capturing **site-specific preferences** (how this factory wants tasks done).
  - Drawback:
    - If this process is slow or tedious, it becomes a **bottleneck for scaling** deployments.

- **Pre-Training (the “general knowledge” engine)**
  - Large, central model that:
    - Accumulates broad experience across **many tasks and environments**.
    - Learns **common sense** about movement, force, objects, and environments.
  - Goal:
    - Provide a **good initial policy** for any new task (“good first guess”).
    - Reduce how much **post-training** is needed at each deployment.
  - This is the analog of an **LLM (Large Language Model)** in robotics:
    - Often referred to as an **AI brain** or **Large Behavior Model (LBM)**.
    - In Alberto’s view, the “AI brain” **must include both**:
      - The **pre-trained common-sense system**.
      - The **post-training adaptation mechanism**.

### 7.3. What Does the “AI Brain” Need to Learn?

The pre-training system must integrate:

1. **General locomotion and whole-body movement**
   - Move **gracefully**, with **agility** and **strength**.
   - Reason about **balance** and **force directions**:
     - If applying force in one direction, anticipate reaction forces and adjust stance.

2. **Spatial perception and visual understanding**
   - From images, infer:
     - **Distances**.
     - Approximate **trajectories** and **reach distances** needed.
   - Understand how to move relative to objects and people in 3D space.

3. **Environment and asset-specific knowledge**
   - For Atlas in factories:
     - There are **known sets of fixtures, tools, and parts**.
     - These can be explicitly integrated rather than “discovered from the internet.”
   - This domain-specific information reduces the amount of **purely unstructured learning** required.

4. **Dexterous manipulation and haptics**
   - Skills:
     - Using tools.
     - Reorienting objects.
     - Inserting parts and recognizing “click-in-place” events.
   - Understand **force control** through fingers and grippers.
   - These capabilities should be part of the **general competence**, not entirely relearned at each site.

---

## 8. Teleoperation and Data Collection

### 8.1. Current Teleoperation Setup

- Teleoperation is a **central method** for:
  - Teaching new tasks (post-training).
  - Providing **corrections** when the robot fails.
- Process:
  - A skilled demonstrator **wears a VR headset**:
    - Sees from Atlas’s perspective in **stereo 3D**.
    - Gains an understanding of what Atlas can and cannot see.
  - Demonstrator uses **body trackers**:
    - Devices on hands, torso, and feet.
    - Movements of the human **drive Atlas in real time**.
  - Over a few weeks, operators develop:
    - Intuition for **Atlas’s dynamics** and limits.
    - Skill in generating **robot-friendly motions**.

### 8.2. Data Requirements Per Behavior

- To train a **single behavior** to high performance:
  - They typically collect **5–10 hours of demonstrations**.
  - Demonstrations include:
    - Standard executions.
    - Variations and failure modes.
    - Operator **corrections** when things go wrong.
- All of this data feeds into **post-training**:
  - The behavior policy is refined to be more robust and reliable.

### 8.3. Limitations and Future Directions

- Teleoperation is:
  - Very effective and widely used today.
  - But possibly **not the ultimate interface** for customers in the long term.
- Likely future interfaces:
  - **Language-based** task specification.
  - **Direct visual demonstration** (e.g., showing the robot how to do tasks without full teleop).
- However, for now, teleoperation remains:
  - The most practical and **reliable way to collect structured robot experience**.

---

## 9. Scaling Training and the Data Flywheel

### 9.1. Reducing On-Site Training Time

- The **main cost** for scaling humanoid deployments:
  - The amount of **post-training effort** per task and per site.
- Strategy to reduce that cost:
  - Invest heavily in **pre-training** (the large behavior model).
  - As pre-training improves:
    - New tasks start from a **stronger initialization**.
    - Fewer post-training hours are needed.

### 9.2. The Data Flywheel

- Every deployment that uses post-training:
  - Generates **high-quality behavior data**.
- That data is then:
  - Fed back into the **pre-training corpus**.
  - Improving the general model’s **common sense and coverage**.
- This yields a **flywheel effect**:
  1. Deploy to customers.
  2. Collect demonstrations and corrections.
  3. Improve pre-trained model.
  4. Future deployments need less post-training.
  5. Scale to more tasks and sites.
  6. Repeat, compounding capabilities over time.

---

## 10. Research Pace and Uncertainties

### 10.1. Speed of Progress

- Alberto’s perspective:
  - This is likely the **fastest period of progress** robotics has ever seen.
  - Many tasks once seen as **impossible** are now **much easier** thanks to modern methods.
- There is a mix of **excitement and anxiety**:
  - The community is **betting** that:
    - Generality will **emerge from scale**, similar to LLMs.
  - But:
    - Full, robust generality in robotics **has not yet been conclusively demonstrated**.

### 10.2. What Is Already Known

- They already know how to:
  - Build robust **hardware platforms** (from Spot & Stretch experience).
  - Design **operator interfaces** and **application software** that respect “rules of the road” in customer facilities.
  - Deliver value in industrial settings and **scale deployments**.
- Current research is focused on:
  - Extending these strengths into the **humanoid domain**.
  - Making the AI stack match the **ambition** of the hardware and product vision.

---

## 11. Deployment Scale and Timeline

### 11.1. How Many Robots, and When?

- Customer-facing statement (from Aya):
  - BD expects **thousands of humanoid robots** deployed in **industrial environments within 5–10 years**.
  - Confidence is drawn from:
    - Existing Spot fleet (thousands already deployed).
    - Research results indicating that early **automotive and industrial tasks** are feasible.
- Alberto’s perspective:
  - Given the **Spot–Stretch–Atlas** offset:
    - Spot: currently in the **scaling phase**.
    - Stretch: ~**two years behind** Spot.
    - Atlas: ~**two years behind** Stretch.
  - Therefore, within **4–5 years**, Atlas could be:
    - Roughly where Spot is **today** in terms of maturity and deployment.

---

## 12. Can I Buy an Atlas Now?

### 12.1. Not a Shelf Product Yet

- Current status:
  - Atlas is **not yet a commercial off-the-shelf product**.
  - You **cannot** simply call a salesperson and place an order.
- BD is in a phase of:
  - **On-site engagements** with select partners.
  - **Hyundai** is the first major early partner:
    - They understand that Atlas is **not yet a hardened product**.
    - They are willing to **co-develop and iterate** with BD.
    - This “eat your own dog food” style engagement helps shape the product.

### 12.2. Partner Mindset vs. Buyer Mindset

- For now:
  - Interested organizations should think in terms of **partnership**, not procurement.
  - The focus is on:
    - Identifying **suitable tasks** for early humanoid deployments.
    - Co-designing workflows that are realistic and safe.
- Suitable early tasks:
  - Areas with:
    - **High labor content**.
    - **Poor ergonomics** (physically taxing or unhealthy for humans).
    - **Gross pick-and-place behaviors**, not yet tiny fine-thread tasks.
- Over the next **1–2 years**:
  - BD expects to move closer to having something that can be treated as a **product** rather than a pure R&D platform.

### 12.3. How Existing BD Products Help

- Customers already using **Spot** and/or **Stretch**:
  - Will have a **faster path** to deploying Atlas later:
    - Spot can handle **mapping and inspection**.
    - These systems provide **contextual data and tooling** that make humanoid deployment smoother.
- BD plans to:
  - Build **plug-and-play-style tools** so that adding Atlas to a Spot-enabled facility becomes much simpler.

---

## 13. Gripper Design and Dexterous Manipulation

### 13.1. Why a Three-Finger Gripper?

- Current Atlas hand:
  - **Three fingers**.
- Rationale:
  - It is **sufficient** for most of the near-term research goals.
  - Empirically:
    - They can grasp **most objects they care about today** with this design.
  - More fingers:
    - Increase **mechanical complexity**.
    - Reduce **reliability**.
    - Slow down development and deployment.

### 13.2. Future Gripper Plans

- BD is actively working on:
  - **More complex grippers** with:
    - Higher dexterity.
    - Ability to **use tools**, perform **assembly**, and handle **small parts**.
  - The next milestone is **dexterous manipulation**:
    - Hands that preserve the **robustness** and **strength** of current designs.
    - While adding **precision** and **fine control** for small, delicate tasks.

### 13.3. Research on Dexterous Manipulation

- Dexterous manipulation occupies a **large fraction** of their research efforts.
- Teleoperation is useful but has limitations for:
  - Very fine finger control.
  - Processing rich **haptic feedback**.
- Two major complementary bets:

1. **Reinforcement Learning (RL) in Simulation**
   - Learns from **trial-and-error** rather than demonstration.
   - Scales faster because:
     - Simulation can run many experiments in parallel.
   - Employed to:
     - Discover dexterous, contact-rich behaviors.
     - Train policies for **complex object handling and assembly** with new grippers.

2. **Learning from Human Hand Use**
   - If the robot hand is **similar in morphology** to the human hand:
     - The system can learn from **direct observation of human demonstrations** (e.g., videos or tracked hand motions).
   - Goal:
     - Make it easier to transfer **human dexterity** into robot behavior models.

---

## 14. Cost Considerations: Legs vs. Wheels

### 14.1. Product Economics

- From a business standpoint:
  - They care about **customer ROI**, not leg vs. wheel ideology.
- If a legged humanoid can:
  - Handle the **widest range of tasks and environments**.
  - Avoid repeated hardware redesigns.
  - Still be built and deployed at a cost that yields **positive ROI**.
- Then legs are aligned with **long-term economic value**.

### 14.2. Engineering Economics

- From an engineering viewpoint:
  - Legs vs. wheels **do not differ drastically in cost** for high-performance industrial platforms.
- Wheeled base that is:
  - **Omnidirectional** and **stable**.
  - Requires:
    - Multiple wheels.
    - Multiple actuators (each wheel often needs two).
    - Additional degrees of freedom (e.g., z-axis).
  - Higher mass → more power → larger components.
- Thus:
  - Total part count and complexity can be **comparable or worse** than legs.
- With legs, you also get:
  - Access to **human-like spaces** (stairs, uneven ground, high/low reach).
  - This aligns with the **general-purpose humanoid** objective.

---

## 15. Closing Messages to Customers

- Humanoids are **not yet a fully hardened, off-the-shelf product**.
- Today:
  - BD is looking for **partners**, not buyers, especially those:
    - With **industrial manufacturing** or **logistics** tasks.
    - With **ergonomically challenging**, **labor-intensive** jobs.
- Customers should think:
  - “Where in my facility does it make sense for humanoids to start?”
  - Rather than: “How do I deploy thousands of humanoids immediately?”
- BD wants early adopters to:
  - Understand that:
    - They are **co-creating a product**.
    - Atlas is still transitioning from **R&D platform** → **product**.
- Meanwhile:
  - Spot and Stretch continue to serve as:
    - Proof that BD can **scale products** and support **large fleets**.
    - Foundations upon which Atlas deployment will be **layered**.

---

## 16. Overall Takeaways

- **Humanoids (Atlas) are aimed squarely at general-purpose manipulation**, especially in settings like automotive manufacturing that require dexterity, flexibility, and adaptability.
- Boston Dynamics leverages:
  - Experience from **Spot** and **Stretch**.
  - A structured **three-phase maturity model**.
  - A combination of **teleoperation, simulation-based RL, and large behavior models**.
- The short term:
  - Focuses on **industrial manufacturing** as the beachhead.
  - Targets tasks where humanoids can **add value soon** while still enabling meaningful research progress.
- The long term:
  - Envisions **thousands of humanoids** operating in industrial settings within **5–10 years**.
  - Anticipates eventual expansion into **homes and other human environments**, contingent on:
    - Safety standards.
    - Reliability at scale.
    - Continued advances in general AI and dexterous manipulation.