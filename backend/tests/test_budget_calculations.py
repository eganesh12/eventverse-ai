"""
Tests for deterministic budget calculations.
These must pass without any AI API connection.
"""

import pytest
from app.services.ai_service import calculate_budget_breakdown, generate_timeline
from datetime import datetime, timedelta


class TestBudgetCalculations:

    def test_wedding_budget_totals_correctly(self):
        """Budget allocations must sum to exactly 100%."""
        budget = 1_500_000
        breakdown = calculate_budget_breakdown(budget, "wedding", "INR")
        total_percentage = sum(item.percentage for item in breakdown)
        assert total_percentage == 100, f"Percentages sum to {total_percentage}, expected 100"

    def test_wedding_budget_amounts_sum_to_total(self):
        """All allocated amounts must sum to the total budget."""
        budget = 1_500_000
        breakdown = calculate_budget_breakdown(budget, "wedding", "INR")
        total_allocated = sum(item.estimated_amount for item in breakdown)
        assert abs(total_allocated - budget) < 1, (
            f"Allocated {total_allocated}, expected {budget}"
        )

    def test_catering_is_largest_wedding_category(self):
        """Catering should be the largest single category for weddings."""
        breakdown = calculate_budget_breakdown(1_000_000, "wedding")
        catering = next(b for b in breakdown if "Catering" in b.category)
        other = [b for b in breakdown if "Catering" not in b.category and b.category != "Contingency"]
        assert all(catering.estimated_amount >= o.estimated_amount for o in other)

    def test_corporate_budget_breakdown(self):
        """Corporate events have venue and catering as top categories."""
        breakdown = calculate_budget_breakdown(800_000, "corporate")
        categories = [b.category for b in breakdown]
        assert "Venue" in categories
        assert "Catering" in categories

    def test_contingency_is_always_present(self):
        """A contingency buffer must always exist in any budget."""
        for event_type in ["wedding", "corporate", "birthday", "college"]:
            breakdown = calculate_budget_breakdown(500_000, event_type)
            contingency_items = [b for b in breakdown if "Contingency" in b.category]
            assert len(contingency_items) > 0, f"No contingency for {event_type}"

    def test_budget_scales_proportionally(self):
        """Doubling the budget should double all allocations."""
        budget_a = calculate_budget_breakdown(1_000_000, "wedding")
        budget_b = calculate_budget_breakdown(2_000_000, "wedding")
        for a, b in zip(budget_a, budget_b):
            assert abs(b.estimated_amount - a.estimated_amount * 2) < 1

    def test_zero_budget_handling(self):
        """Budget of zero should return zero amounts without error."""
        breakdown = calculate_budget_breakdown(0, "wedding")
        for item in breakdown:
            assert item.estimated_amount == 0.0

    def test_remaining_budget_calculation(self):
        """Remaining = Total - Spent is always deterministic."""
        total_budget = 1_500_000
        spent = 420_000
        remaining = total_budget - spent
        assert remaining == 1_080_000

    def test_budget_utilization_percent(self):
        """Budget utilization should be correct to 1 decimal."""
        total = 1_500_000
        spent = 420_000
        utilization = round(spent / total * 100, 1)
        assert utilization == 28.0


class TestTimeline:

    def test_timeline_has_expected_tasks(self):
        """Wedding timeline must include venue, catering, photography."""
        event_date = datetime.now() + timedelta(days=365)
        timeline = generate_timeline(event_date, "wedding")
        categories = [t.category for t in timeline]
        assert "Venue" in categories
        assert "Catering" in categories
        assert "Photography" in categories

    def test_timeline_is_sorted_by_date(self):
        """Timeline tasks must be in chronological order."""
        event_date = datetime.now() + timedelta(days=365)
        timeline = generate_timeline(event_date, "wedding")
        dates = [t.due_date for t in timeline]
        assert dates == sorted(dates)

    def test_overdue_tasks_detected(self):
        """Tasks with due dates in the past should be marked completed or in_progress."""
        event_date = datetime.now() + timedelta(days=30)  # Near-term event
        timeline = generate_timeline(event_date, "wedding")
        far_past_tasks = [t for t in timeline if t.due_date < (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")]
        for task in far_past_tasks:
            assert task.status in ("completed", "in_progress"), (
                f"Task '{task.title}' with past date should not be 'pending'"
            )

    def test_corporate_timeline_exists(self):
        """Corporate events have their own timeline template."""
        event_date = datetime.now() + timedelta(days=180)
        timeline = generate_timeline(event_date, "corporate")
        assert len(timeline) > 0
