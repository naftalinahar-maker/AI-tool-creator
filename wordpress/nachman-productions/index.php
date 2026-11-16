<?php
/**
 * Generic template: blog, archives, single posts and pages.
 *
 * @package nachman
 */

get_header();
?>
<main id="main" class="section page-main">
	<div class="container container--narrow">
		<?php if ( have_posts() ) : ?>
			<?php if ( ! is_singular() ) : ?>
				<h1 class="section__title"><?php echo is_home() ? 'בלוג' : wp_kses_post( get_the_archive_title() ); ?></h1>
			<?php endif; ?>

			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<article <?php post_class( 'entry' ); ?>>
					<?php if ( is_singular() ) : ?>
						<h1 class="section__title"><?php the_title(); ?></h1>
						<?php if ( has_post_thumbnail() ) : ?>
							<div class="entry__thumb"><?php the_post_thumbnail( 'large' ); ?></div>
						<?php endif; ?>
						<div class="entry__content"><?php the_content(); ?></div>
					<?php else : ?>
						<h2 class="entry__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div class="entry__content"><?php the_excerpt(); ?></div>
					<?php endif; ?>
				</article>
			<?php endwhile; ?>

			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<h1 class="section__title">לא נמצא תוכן</h1>
			<p><a class="btn btn--fire" href="<?php echo esc_url( home_url( '/' ) ); ?>">חזרה לדף הבית</a></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
