<?php
/**
 * 404 page.
 *
 * @package nachman
 */

get_header();
?>
<main id="main" class="section page-main">
	<div class="container container--narrow" style="text-align:center">
		<p class="eyebrow">שגיאה 404</p>
		<h1 class="section__title">הסצנה הזאת נחתכה בעריכה ✂️</h1>
		<p class="section__lead">הדף שחיפשתם לא קיים.</p>
		<p><a class="btn btn--fire" href="<?php echo esc_url( home_url( '/' ) ); ?>">חזרה לדף הבית</a></p>
	</div>
</main>
<?php
get_footer();
